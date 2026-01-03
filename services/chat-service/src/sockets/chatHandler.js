const ChatMessage = require('../models/ChatMessage');

module.exports = (io, socket) => {
    console.log(`🔌 New Connection: ${socket.id}`);

    // EVENT 1: User/Agent Joins a specific chat room
    socket.on('join_room', async (roomId) => {
        socket.join(roomId);
        console.log(`👤 User ${socket.id} joined room: ${roomId}`);
        
        // Optional: Load previous chat history from DB and send it to the user
        // so they see what they said before.
        try {
            const history = await ChatMessage.find({ roomId }).sort({ timestamp: 1 }).limit(50);
            socket.emit('load_history', history);
        } catch (err) {
            console.error('Error loading history:', err);
        }
    });

    // EVENT 2: User sends a message
    socket.on('send_message', async (data) => {
        const { roomId, sender, senderId, message } = data;

        // 1. Send to everyone in the room (Real-time)
        // 'io.to(roomId)' sends it to both Customer and Agent in that room
        io.to(roomId).emit('receive_message', data);

        // 2. Save to Database (Async - Persistence)
        try {
            await ChatMessage.create({
                roomId,
                sender,
                senderId,
                message
            });
            console.log(`💾 Message saved to DB for room: ${roomId}`);
        } catch (err) {
            console.error('❌ DB Save Failed:', err);
        }
    });

    // EVENT 3: Disconnect
    socket.on('disconnect', () => {
        console.log(`❌ Disconnected: ${socket.id}`);
    });
};