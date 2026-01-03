const { redisClient } = require('../config/redis');

class QueueManager {
  constructor() {
    this.QUEUE_KEY = 'customer_queue';
  }

  // Add customer to queue
  async addToQueue(customerId, customerName, roomId) {
    const queueItem = JSON.stringify({
      customerId,
      customerName,
      roomId,
      joinedAt: Date.now()
    });
    
    await redisClient.rPush(this.QUEUE_KEY, queueItem);
    const position = await redisClient.lLen(this.QUEUE_KEY);
    
    console.log(`📋 Customer ${customerId} added to queue at position ${position}`);
    return position;
  }

  // Get next customer from queue
  async getNextCustomer() {
    const item = await redisClient.lPop(this.QUEUE_KEY);
    if (!item) return null;
    
    return JSON.parse(item);
  }

  // Get queue length
  async getQueueLength() {
    return await redisClient.lLen(this.QUEUE_KEY);
  }

  // Get customer's position in queue
  async getPosition(customerId) {
    const queue = await redisClient.lRange(this.QUEUE_KEY, 0, -1);
    const position = queue.findIndex(item => {
      const data = JSON.parse(item);
      return data.customerId === customerId;
    });
    
    return position === -1 ? null : position + 1;
  }

  // Remove customer from queue
  async removeFromQueue(customerId) {
    const queue = await redisClient.lRange(this.QUEUE_KEY, 0, -1);
    
    for (const item of queue) {
      const data = JSON.parse(item);
      if (data.customerId === customerId) {
        await redisClient.lRem(this.QUEUE_KEY, 1, item);
        console.log(`📋 Customer ${customerId} removed from queue`);
        return true;
      }
    }
    
    return false;
  }
}

module.exports = new QueueManager();