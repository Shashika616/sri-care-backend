const ChatSession = require('../models/ChatSession');

class SessionCleaner {
  constructor(io) {
    this.io = io;
    this.TIMEOUT_MINUTES = parseInt(process.env.CHAT_TIMEOUT_MINUTES) || 30;
  }

  start() {
    // Run every 5 minutes
    setInterval(() => this.cleanInactiveSessions(), 5 * 60 * 1000);
    console.log(`🧹 Session cleaner started (timeout: ${this.TIMEOUT_MINUTES} minutes)`);
  }

  async cleanInactiveSessions() {
    try {
      const timeoutDate = new Date(Date.now() - this.TIMEOUT_MINUTES * 60 * 1000);
      
      const inactiveSessions = await ChatSession.find({
        status: 'active',
        lastActivityAt: { $lt: timeoutDate }
      });

      for (const session of inactiveSessions) {
        session.status = 'closed';
        session.closedAt = new Date();
        session.closeReason = 'timeout';
        await session.save();

        this.io.to(session.roomId).emit('chat:closed', {
          message: 'This chat has been closed due to inactivity',
          reason: 'timeout'
        });

        console.log(`🧹 Closed inactive chat: ${session.roomId}`);
      }

      if (inactiveSessions.length > 0) {
        console.log(`🧹 Cleaned ${inactiveSessions.length} inactive sessions`);
      }
    } catch (error) {
      console.error('Error in session cleaner:', error);
    }
  }
}

module.exports = SessionCleaner;