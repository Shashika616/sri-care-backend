require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const chatHandler = require('./sockets/chatHandler');

const app = express();
app.use(cors()); // Allow frontend to connect
app.use(express.json());

// 1. Connect to Database
connectDB();

// 2. Create HTTP Server & Attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow connections from React/Flutter Apps
        methods: ["GET", "POST"]
    }
});

// 3. Initialize Socket Logic
io.on('connection', (socket) => {
    chatHandler(io, socket);
});

// Health Check
app.get('/', (req, res) => {
    res.send('Sri-Care Chat Service is Running 💬');
});

const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
    console.log(`🚀 Chat Service running on port ${PORT}`);
});