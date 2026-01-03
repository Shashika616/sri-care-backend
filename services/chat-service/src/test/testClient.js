// test/chat-service.test.js
const io = require('socket.io-client');
const { redisClient } = require('../config/redis');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

// Config
const SOCKET_URL = 'http://localhost:4000';
const TEST_TIMEOUT = 15000; // 15s per test

// Helper: delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: flush Redis
async function flushRedis() {
  await redisClient.connect();
  await redisClient.flushDb();
  console.log('🗑️ Redis flushed');
}

// Disconnect all sockets cleanly
async function cleanupSockets(sockets) {
  await Promise.all(sockets.map(s => {
    return new Promise(resolve => {
      if (s.connected) s.disconnect();
      resolve();
    });
  }));
}

describe('Chat Service Integration Tests', () => {
  let sockets = [];

  beforeAll(async () => {
    await flushRedis();
  });

  afterEach(async () => {
    await cleanupSockets(sockets);
    sockets = [];
  });

  // Utility to create and track sockets
  function createSocket() {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    sockets.push(socket);
    return socket;
  }

  test('1. Customer joins → no agent → enters queue', async () => {
    const customer = createSocket();
    let queued = false;

    customer.on('customer:queued', (data) => {
      expect(data.position).toBe(1);
      queued = true;
    });

    await new Promise((resolve) => {
      customer.on('connect', () => {
        customer.emit('customer:join', {
          customerId: 'test1_cust',
          customerName: 'Test1 Customer'
        });
      });
      customer.on('customer:queued', resolve);
    });

    expect(queued).toBe(true);
  }, TEST_TIMEOUT);

  test('2. Agent comes online → assigns waiting customer', async () => {
    // First, add a customer to queue
    const customer = createSocket();
    let customerAssigned = false;

    await new Promise((resolve) => {
      customer.on('connect', () => {
        customer.emit('customer:join', {
          customerId: 'test2_cust',
          customerName: 'Test2 Customer'
        });
      });
      customer.on('customer:queued', resolve);
    });

    // Now bring agent online
    const agent = createSocket();
    let agentNotified = false;

    agent.on('agent:new-customer', (data) => {
      expect(data.customerId).toBe('test2_cust');
      agentNotified = true;
      agent.emit('agent:join-room', { roomId: data.roomId });
    });

    customer.on('customer:agent-assigned', () => {
      customerAssigned = true;
    });

    await new Promise((resolve) => {
      agent.on('connect', () => {
        agent.emit('agent:online', {
          agentId: 'test2_agent',
          agentName: 'Test2 Agent'
        });
      });
      // Wait for both sides to confirm
      const check = setInterval(() => {
        if (agentNotified && customerAssigned) {
          clearInterval(check);
          resolve();
        }
      }, 200);
    });

    expect(agentNotified).toBe(true);
    expect(customerAssigned).toBe(true);
  }, TEST_TIMEOUT);

  test('3. Messaging between customer and agent', async () => {
    // Setup agent first
    const agent = createSocket();
    await new Promise(resolve => {
      agent.on('connect', () => {
        agent.emit('agent:online', {
          agentId: 'test3_agent',
          agentName: 'Test3 Agent'
        });
      });
      agent.on('agent:online-success', resolve);
    });

    const customer = createSocket();
    let roomId;
    customer.on('customer:agent-assigned', (data) => {
      roomId = data.roomId;
    });

    await new Promise(resolve => {
      customer.on('connect', () => {
        customer.emit('customer:join', {
          customerId: 'test3_cust',
          customerName: 'Test3 Customer'
        });
      });
      customer.on('customer:agent-assigned', resolve);
    });

    // Exchange messages
    let custReceived = false;
    let agentReceived = false;

    customer.on('message:received', (msg) => {
      if (msg.senderRole === 'agent') custReceived = true;
    });

    agent.on('message:received', (msg) => {
      if (msg.senderRole === 'customer') agentReceived = true;
    });

    // Customer sends
    customer.emit('message:send', {
      roomId,
      message: 'Hello from customer',
      recipientId: 'test3_agent'
    });

    // Agent sends
    await sleep(200);
    agent.emit('message:send', {
      roomId,
      message: 'Hello from agent',
      recipientId: 'test3_cust'
    });

    await sleep(500); // Allow delivery

    expect(custReceived).toBe(true);
    expect(agentReceived).toBe(true);
  }, TEST_TIMEOUT);

  test('4. Agent disconnect → reassign to new agent', async () => {
    // First agent
    const agent1 = createSocket();
    await new Promise(resolve => {
      agent1.on('connect', () => {
        agent1.emit('agent:online', {
          agentId: 'agent1',
          agentName: 'Agent One'
        });
      });
      agent1.on('agent:online-success', resolve);
    });

    const customer = createSocket();
    let roomId;
    customer.on('customer:agent-assigned', (data) => {
      roomId = data.roomId;
    });

    await new Promise(resolve => {
      customer.on('connect', () => {
        customer.emit('customer:join', {
          customerId: 'reassign_cust',
          customerName: 'Reassign Customer'
        });
      });
      customer.on('customer:agent-assigned', resolve);
    });

    // Now disconnect agent1
    agent1.disconnect();

    // Bring agent2 online
    const agent2 = createSocket();
    let reassigned = false;
    agent2.on('agent:new-customer', (data) => {
      if (data.transferred) reassigned = true;
    });

    await new Promise(resolve => {
      agent2.on('connect', () => {
        agent2.emit('agent:online', {
          agentId: 'agent2',
          agentName: 'Agent Two'
        });
      });
      const check = setInterval(() => {
        if (reassigned) {
          clearInterval(check);
          resolve();
        }
      }, 300);
    });

    expect(reassigned).toBe(true);
  }, TEST_TIMEOUT);

  test('5. Customer reconnects → resumes session', async () => {
    // Setup
    const agent = createSocket();
    await new Promise(resolve => {
      agent.on('connect', () => {
        agent.emit('agent:online', {
          agentId: 'reconnect_agent',
          agentName: 'Reconnect Agent'
        });
      });
      agent.on('agent:online-success', resolve);
    });

    const customer1 = createSocket();
    let roomId;
    await new Promise(resolve => {
      customer1.on('connect', () => {
        customer1.emit('customer:join', {
          customerId: 'reconnect_cust',
          customerName: 'Reconnect Customer'
        });
      });
      customer1.on('customer:agent-assigned', (data) => {
        roomId = data.roomId;
        resolve();
      });
    });

    // Simulate disconnect
    customer1.disconnect();

    // Reconnect
    const customer2 = createSocket();
    let historyReceived = false;
    let assignedAgain = false;

    customer2.on('customer:chat-history', (msgs) => {
      historyReceived = msgs.length >= 1;
    });

    customer2.on('customer:agent-assigned', () => {
      assignedAgain = true;
    });

    await new Promise(resolve => {
      customer2.on('connect', () => {
        customer2.emit('customer:join', {
          customerId: 'reconnect_cust',
          customerName: 'Reconnect Customer'
        });
      });
      const check = setInterval(() => {
        if (historyReceived && assignedAgain) {
          clearInterval(check);
          resolve();
        }
      }, 200);
    });

    expect(historyReceived).toBe(true);
    expect(assignedAgain).toBe(true);
  }, TEST_TIMEOUT);

  test('6. Chat timeout closes inactive session', async () => {
    // Override timeout to 5 seconds for test
    process.env.CHAT_TIMEOUT_MINUTES = '0.1'; // ~6 seconds

    const agent = createSocket();
    await new Promise(resolve => {
      agent.on('connect', () => {
        agent.emit('agent:online', {
          agentId: 'timeout_agent',
          agentName: 'Timeout Agent'
        });
      });
      agent.on('agent:online-success', resolve);
    });

    const customer = createSocket();
    let roomId;
    await new Promise(resolve => {
      customer.on('connect', () => {
        customer.emit('customer:join', {
          customerId: 'timeout_cust',
          customerName: 'Timeout Customer'
        });
      });
      customer.on('customer:agent-assigned', (data) => {
        roomId = data.roomId;
        resolve();
      });
    });

    // Wait for timeout (~7 seconds)
    await sleep(8000);

    // Check DB
    const session = await ChatSession.findOne({ roomId });
    expect(session.status).toBe('closed');
    expect(session.closeReason).toBe('timeout');
  }, 12000); // longer timeout

  test('7. Agent respects MAX_CHATS_PER_AGENT', async () => {
    // Start 1 agent
    const agent = createSocket();
    await new Promise(resolve => {
      agent.on('connect', () => {
        agent.emit('agent:online', {
          agentId: 'load_agent',
          agentName: 'Load Agent'
        });
      });
      agent.on('agent:online-success', resolve);
    });

    const maxChats = parseInt(process.env.MAX_CHATS_PER_AGENT) || 5;
    const promises = [];

    // Add N = maxChats customers
    for (let i = 0; i < maxChats; i++) {
      const customer = createSocket();
      promises.push(
        new Promise(resolve => {
          customer.on('connect', () => {
            customer.emit('customer:join', {
              customerId: `load_cust_${i}`,
              customerName: `Load Customer ${i}`
            });
          });
          customer.on('customer:agent-assigned', resolve);
          customer.on('customer:queued', resolve); // in case queued
        })
      );
    }

    await Promise.all(promises);

    // Add one more customer
    const extraCustomer = createSocket();
    let extraQueued = false;
    extraCustomer.on('customer:queued', () => {
      extraQueued = true;
    });

    await new Promise(resolve => {
      extraCustomer.on('connect', () => {
        extraCustomer.emit('customer:join', {
          customerId: 'extra_cust',
          customerName: 'Extra Customer'
        });
      });
      setTimeout(resolve, 1000); // wait briefly
    });

    expect(extraQueued).toBe(true); // should be queued, not assigned
  }, TEST_TIMEOUT);
});