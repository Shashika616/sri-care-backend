// ==================== src/server.js ====================
require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const ChatHandler = require('./sockets/chatHandler');
const SessionCleaner = require('./utils/sessionCleaner');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // Enhanced connection settings
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'chat-service',
    timestamp: new Date().toISOString()
  });
});

// REST API: Get chat history
app.get('/api/chat/history/:roomId', async (req, res) => {
  try {
    const ChatMessage = require('./models/ChatMessage');
    const messages = await ChatMessage.find({ roomId: req.params.roomId })
      .sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// REST API: Get active sessions
app.get('/api/sessions/active', async (req, res) => {
  try {
    const ChatSession = require('./models/ChatSession');
    const sessions = await ChatSession.find({ status: 'active' });
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// REST API: Get queue status
app.get('/api/queue/status', async (req, res) => {
  try {
    const queueManager = require('./utils/queueManager');
    const length = await queueManager.getQueueLength();
    res.json({ success: true, queueLength: length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize Socket.IO handler
const chatHandler = new ChatHandler(io);
io.on('connection', (socket) => chatHandler.handleConnection(socket));

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Rejection:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    // Start session cleaner
    const sessionCleaner = new SessionCleaner(io);
    sessionCleaner.start();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Chat Service v2.0 (Production)`);
      console.log(`Port: ${PORT}`);
      console.log(`WebSocket: ws://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);

    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();