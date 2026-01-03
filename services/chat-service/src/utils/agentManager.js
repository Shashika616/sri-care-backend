const { redisClient } = require('../config/redis');
const ChatSession = require('../models/ChatSession');

class AgentManager {
  constructor() {
    this.MAX_CHATS_PER_AGENT = parseInt(process.env.MAX_CHATS_PER_AGENT) || 5;
  }

  // Add agent to online list
  async markAgentOnline(agentId, socketId) {
    await redisClient.hSet('online_agents', agentId, socketId);
    console.log(`🟢 Agent ${agentId} is now online`);
  }

  // Remove agent from online list
  async markAgentOffline(agentId) {
    await redisClient.hDel('online_agents', agentId);
    console.log(`🔴 Agent ${agentId} is now offline`);
  }

  // Get all online agents
  async getOnlineAgents() {
    const agents = await redisClient.hGetAll('online_agents');
    return Object.keys(agents);
  }

  // Find available agent with load balancing
  async findAvailableAgent() {
    const onlineAgents = await this.getOnlineAgents();
    
    if (onlineAgents.length === 0) {
      return null;
    }

    // Check agent load and find least busy agent
    let leastBusyAgent = null;
    let minChats = this.MAX_CHATS_PER_AGENT;

    for (const agentId of onlineAgents) {
      const activeChats = await ChatSession.countDocuments({
        agentId,
        status: 'active'
      });

      if (activeChats < minChats) {
        minChats = activeChats;
        leastBusyAgent = agentId;
      }

      // If agent has no chats, assign immediately
      if (activeChats === 0) {
        return agentId;
      }
    }

    // Return least busy agent if under capacity
    return minChats < this.MAX_CHATS_PER_AGENT ? leastBusyAgent : null;
  }

  // Get agent's socket ID
  async getAgentSocketId(agentId) {
    return await redisClient.hGet('online_agents', agentId);
  }

  // Get agent's active chat count
  async getAgentChatCount(agentId) {
    return await ChatSession.countDocuments({
      agentId,
      status: 'active'
    });
  }

  // Track customer-agent assignment
  async assignAgentToCustomer(customerId, agentId) {
    await redisClient.hSet('customer_assignments', customerId, agentId);
  }

  // Get assigned agent for a customer
  async getAssignedAgent(customerId) {
    return await redisClient.hGet('customer_assignments', customerId);
  }

  // Clear customer assignment
  async clearCustomerAssignment(customerId) {
    await redisClient.hDel('customer_assignments', customerId);
  }
}

module.exports = new AgentManager();