const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Redis reconnect failed');
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
redisClient.on('connect', () => console.log('✅ Redis Connected'));
redisClient.on('reconnecting', () => console.log('🔄 Redis Reconnecting...'));

// Connect Reddis for Prod

// const connectRedis = async () => {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//   }
// };

// Temporarily modify your redis.js:
const connectRedis = async () => {
  console.log('⚠️ Redis disabled for development');
  // Return a mock Redis client
  return {
    get: async () => null,
    set: async () => 'OK',
    quit: async () => {}
  };
};

module.exports = { redisClient, connectRedis };