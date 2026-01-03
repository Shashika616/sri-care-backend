const ChatMessage = require('../models/ChatMessage');
const ChatSession = require('../models/ChatSession');
const agentManager = require('../utils/agentManager');
const queueManager = require('../utils/queueManager');

class ChatHandler {
  constructor(io) {
    this.io = io;
  }

  handleConnection(socket) {
    console.log(`🔌 New connection: ${socket.id}`);

    // Customer joins chat
    socket.on('customer:join', async (data) => {
      try {
        const { customerId, customerName } = data;
        const roomId = `room_${customerId}`;

        // Check for existing connections (multiple devices)
        const existingSockets = await this.io.in(roomId).fetchSockets();
        if (existingSockets.length > 0) {
          // Kick old connection
          existingSockets.forEach(s => {
            s.emit('session:terminated', {
              reason: 'Opened on another device'
            });
            s.disconnect();
          });
        }

        socket.join(roomId);
        socket.customerId = customerId;
        socket.customerName = customerName;
        socket.role = 'customer';
        socket.roomId = roomId;

        console.log(`👤 Customer ${customerId} joined room: ${roomId}`);

        // Check if session exists
        let session = await ChatSession.findOne({ roomId });
        
        if (!session) {
          // Create new session
          session = await ChatSession.create({
            roomId,
            customerId,
            customerName,
            status: 'waiting'
          });

          // Try to find an available agent
          const availableAgent = await agentManager.findAvailableAgent();
          
          if (availableAgent) {
            await this.assignAgentToSession(session, availableAgent, socket);
          } else {
            // Add to queue
            const position = await queueManager.addToQueue(customerId, customerName, roomId);
            
            socket.emit('customer:queued', {
              position,
              message: `You are #${position} in queue. An agent will be with you shortly.`,
              estimatedWaitMinutes: Math.ceil(position * 2)
            });
          }
        } else {
          // Existing session - send chat history
          const messages = await ChatMessage.find({ roomId })
            .sort({ timestamp: 1 })
            .limit(100);

          socket.emit('customer:chat-history', messages);

          if (session.status === 'active' && session.agentId) {
            socket.emit('customer:agent-assigned', {
              agentId: session.agentId,
              agentName: session.agentName,
              message: 'Reconnected to your agent'
            });
          } else if (session.status === 'closed') {
            socket.emit('customer:session-closed', {
              message: 'This chat was closed. Start a new chat?'
            });
          }
        }

        // Update last activity
        await ChatSession.updateOne({ roomId }, { lastActivityAt: new Date() });

      } catch (error) {
        console.error('Error in customer:join:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Agent joins the system
    socket.on('agent:online', async (data) => {
      try {
        const { agentId, agentName } = data;
        
        socket.agentId = agentId;
        socket.agentName = agentName;
        socket.role = 'agent';

        await agentManager.markAgentOnline(agentId, socket.id);

        const chatCount = await agentManager.getAgentChatCount(agentId);

        socket.emit('agent:online-success', {
          message: 'You are now online and ready to receive chats',
          activeChats: chatCount
        });

        console.log(`👨‍💼 Agent ${agentId} is online`);

        // Process queue if there are waiting customers
        await this.processQueue();

      } catch (error) {
        console.error('Error in agent:online:', error);
        socket.emit('error', { message: 'Failed to come online' });
      }
    });

    // Agent joins a specific customer room
    socket.on('agent:join-room', async (data) => {
      try {
        const { roomId } = data;
        socket.join(roomId);

        // Load chat history
        const messages = await ChatMessage.find({ roomId })
          .sort({ timestamp: 1 })
          .limit(100);

        socket.emit('agent:chat-history', messages);

        // Update session activity
        await ChatSession.updateOne({ roomId }, { lastActivityAt: new Date() });

        console.log(`👨‍💼 Agent ${socket.agentId} joined ${roomId}`);
      } catch (error) {
        console.error('Error in agent:join-room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle message sending with acknowledgment
    socket.on('message:send', async (data, callback) => {
      try {
        const { roomId, message, recipientId } = data;

        if (!socket.role) {
          const error = { success: false, error: 'Role not identified' };
          if (callback) callback(error);
          else socket.emit('error', error);
          return;
        }

        let chatMessage;
        try {
          chatMessage = await ChatMessage.create({
            roomId,
            senderId: socket.role === 'customer' ? socket.customerId : socket.agentId,
            senderRole: socket.role,
            recipientId,
            message,
            timestamp: new Date(),
            deliveryStatus: 'sent'
          });
        } catch (dbError) {
          // Fallback: Save to Redis if MongoDB is down
          console.error('MongoDB write failed, using Redis fallback:', dbError);
          
          const fallbackMessage = {
            roomId,
            senderId: socket.role === 'customer' ? socket.customerId : socket.agentId,
            senderRole: socket.role,
            recipientId,
            message,
            timestamp: new Date().toISOString()
          };
          
          await this.redisClient.rPush(
            `fallback_messages:${roomId}`,
            JSON.stringify(fallbackMessage)
          );
          
          chatMessage = { ...fallbackMessage, _id: 'temp_' + Date.now() };
        }

        // Broadcast to everyone in the room
        this.io.to(roomId).emit('message:received', {
          messageId: chatMessage._id,
          senderId: chatMessage.senderId,
          senderRole: chatMessage.senderRole,
          senderName: socket.role === 'customer' ? socket.customerName : socket.agentName,
          message: chatMessage.message,
          timestamp: chatMessage.timestamp
        });

        // Update session activity
        await ChatSession.updateOne({ roomId }, { lastActivityAt: new Date() });

        // Send acknowledgment to sender
        if (callback) {
          callback({
            success: true,
            messageId: chatMessage._id,
            timestamp: chatMessage.timestamp
          });
        }

        console.log(`💬 Message in ${roomId} from ${socket.role}: ${message.substring(0, 30)}...`);
      } catch (error) {
        console.error('Error in message:send:', error);
        const errorResponse = { success: false, error: error.message };
        if (callback) callback(errorResponse);
        else socket.emit('error', errorResponse);
      }
    });

    // Typing indicators
    socket.on('typing:start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user:typing', {
        userId: socket.customerId || socket.agentId,
        userName: socket.customerName || socket.agentName,
        role: socket.role
      });
    });

    socket.on('typing:stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user:stopped-typing', {
        userId: socket.customerId || socket.agentId,
        role: socket.role
      });
    });

    // Agent closes a chat
    socket.on('agent:close-chat', async (data) => {
      try {
        const { roomId, reason } = data;

        await ChatSession.findOneAndUpdate(
          { roomId },
          { 
            status: 'closed', 
            closedAt: new Date(),
            closeReason: reason || 'agent_closed'
          }
        );

        this.io.to(roomId).emit('chat:closed', {
          message: 'This chat has been closed by the agent',
          reason: reason || 'agent_closed'
        });

        // Clear assignment
        const session = await ChatSession.findOne({ roomId });
        if (session) {
          await agentManager.clearCustomerAssignment(session.customerId);
        }

        console.log(`🔒 Chat ${roomId} closed by agent ${socket.agentId}`);

        // Process queue for next customer
        await this.processQueue();

      } catch (error) {
        console.error('Error in agent:close-chat:', error);
        socket.emit('error', { message: 'Failed to close chat' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 Disconnected: ${socket.id}`);

      if (socket.role === 'agent' && socket.agentId) {
        await agentManager.markAgentOffline(socket.agentId);
        
        // Reassign active chats to other agents
        await this.handleAgentDisconnect(socket.agentId);
      } else if (socket.role === 'customer' && socket.customerId) {
        // Customer disconnected - keep session active for potential reconnect
        console.log(`👤 Customer ${socket.customerId} disconnected (session kept active)`);
      }
    });
  }

  // Helper: Assign agent to session
  async assignAgentToSession(session, agentId, customerSocket) {
    session.agentId = agentId;
    session.status = 'active';
    session.agentName = 'Agent'; // You can store agent name in Redis or DB
    await session.save();
    
    await agentManager.assignAgentToCustomer(session.customerId, agentId);

    // Notify the agent
    const agentSocketId = await agentManager.getAgentSocketId(agentId);
    if (agentSocketId) {
      this.io.to(agentSocketId).emit('agent:new-customer', {
        customerId: session.customerId,
        customerName: session.customerName,
        roomId: session.roomId
      });
    }

    // Notify the customer
    customerSocket.emit('customer:agent-assigned', {
      agentId: agentId,
      agentName: session.agentName,
      message: 'An agent has been assigned to you'
    });

    // Send system message
    await ChatMessage.create({
      roomId: session.roomId,
      senderId: 'system',
      senderRole: 'system',
      recipientId: session.customerId,
      message: `Agent ${session.agentName} has joined the chat`,
      timestamp: new Date()
    });
  }

  // Helper: Process customer queue
  async processQueue() {
    const queueLength = await queueManager.getQueueLength();
    if (queueLength === 0) return;

    const availableAgent = await agentManager.findAvailableAgent();
    if (!availableAgent) return;

    const customer = await queueManager.getNextCustomer();
    if (!customer) return;

    console.log(`📋 Processing queue: Assigning ${customer.customerId} to ${availableAgent}`);

    const session = await ChatSession.findOne({ roomId: customer.roomId });
    if (session && session.status === 'waiting') {
      session.agentId = availableAgent;
      session.status = 'active';
      await session.save();

      await agentManager.assignAgentToCustomer(customer.customerId, availableAgent);

      // Notify agent
      const agentSocketId = await agentManager.getAgentSocketId(availableAgent);
      if (agentSocketId) {
        this.io.to(agentSocketId).emit('agent:new-customer', {
          customerId: customer.customerId,
          customerName: customer.customerName,
          roomId: customer.roomId
        });
      }

      // Notify customer
      this.io.to(customer.roomId).emit('customer:agent-assigned', {
        agentId: availableAgent,
        message: 'An agent has been assigned to you'
      });
    }

    // Continue processing if more customers and agents available
    setTimeout(() => this.processQueue(), 1000);
  }

  // Helper: Handle agent disconnect and reassign chats
  async handleAgentDisconnect(agentId) {
    const activeChats = await ChatSession.find({
      agentId: agentId,
      status: 'active'
    });

    for (const chat of activeChats) {
      const newAgent = await agentManager.findAvailableAgent();
      
      if (newAgent) {
        // Reassign to new agent
        chat.agentId = newAgent;
        chat.status = 'transferred';
        await chat.save();

        await agentManager.assignAgentToCustomer(chat.customerId, newAgent);

        // Notify new agent
        const newAgentSocketId = await agentManager.getAgentSocketId(newAgent);
        if (newAgentSocketId) {
          this.io.to(newAgentSocketId).emit('agent:new-customer', {
            customerId: chat.customerId,
            customerName: chat.customerName,
            roomId: chat.roomId,
            transferred: true,
            previousAgent: agentId
          });
        }

        // Notify customer
        this.io.to(chat.roomId).emit('agent:changed', {
          message: 'Your previous agent disconnected. You have been assigned to a new agent.',
          newAgentId: newAgent
        });

        // System message
        await ChatMessage.create({
          roomId: chat.roomId,
          senderId: 'system',
          senderRole: 'system',
          recipientId: chat.customerId,
          message: 'Agent disconnected. A new agent has been assigned to your chat.',
          timestamp: new Date()
        });
      } else {
        // No agents available - add back to queue
        await queueManager.addToQueue(chat.customerId, chat.customerName, chat.roomId);
        chat.status = 'waiting';
        chat.agentId = null;
        await chat.save();

        this.io.to(chat.roomId).emit('customer:queued', {
          message: 'Agent disconnected. You have been added to the queue.',
          position: await queueManager.getPosition(chat.customerId)
        });
      }
    }
  }
}

module.exports = ChatHandler;