// src/utils/voicePackages.js

const voicePackages = [
  { name: "Local 100 Min", type: "voice", cost: 80, validity: 7, dataQuota: null, voiceQuota: 100, description: "100 local call minutes valid for 7 days" },
  { name: "Local 250 Min", type: "voice", cost: 180, validity: 30, dataQuota: null, voiceQuota: 250, description: "250 local call minutes valid for 30 days" },
  { name: "Local 500 Min", type: "voice", cost: 300, validity: 30, dataQuota: null, voiceQuota: 500, description: "500 local call minutes valid for 30 days" },
  { name: "International 50 Min", type: "voice", cost: 400, validity: 30, dataQuota: null, voiceQuota: 50, description: "50 minutes for international calls" },
  { name: "International 100 Min", type: "voice", cost: 750, validity: 30, dataQuota: null, voiceQuota: 100, description: "100 minutes for international calls" },
  { name: "Evening Calls 100 Min", type: "voice", cost: 60, validity: 30, dataQuota: null, voiceQuota: 100, description: "100 minutes valid from 6PM-12AM" },
  { name: "Evening Calls 200 Min", type: "voice", cost: 120, validity: 30, dataQuota: null, voiceQuota: 200, description: "200 minutes valid from 6PM-12AM" },
  { name: "Weekend Calls 100 Min", type: "voice", cost: 50, validity: 7, dataQuota: null, voiceQuota: 100, description: "100 minutes usable only on weekends" },
  { name: "Weekend Calls 250 Min", type: "voice", cost: 120, validity: 7, dataQuota: null, voiceQuota: 250, description: "250 minutes usable only on weekends" },
  { name: "Night Calls 50 Min", type: "voice", cost: 40, validity: 30, dataQuota: null, voiceQuota: 50, description: "50 minutes valid from 12AM-6AM" },
  { name: "Night Calls 100 Min", type: "voice", cost: 70, validity: 30, dataQuota: null, voiceQuota: 100, description: "100 minutes valid from 12AM-6AM" },
  { name: "Family Talk 200 Min", type: "voice", cost: 150, validity: 30, dataQuota: null, voiceQuota: 200, description: "200 minutes shareable among family members" },
  { name: "Family Talk 500 Min", type: "voice", cost: 350, validity: 30, dataQuota: null, voiceQuota: 500, description: "500 minutes shareable among family members" },
  { name: "Student Pack 100 Min", type: "voice", cost: 60, validity: 30, dataQuota: null, voiceQuota: 100, description: "100 minutes for student accounts" },
  { name: "Student Pack 200 Min", type: "voice", cost: 100, validity: 30, dataQuota: null, voiceQuota: 200, description: "200 minutes for student accounts" },
  { name: "Business Pack 500 Min", type: "voice", cost: 500, validity: 30, dataQuota: null, voiceQuota: 500, description: "500 minutes for business use" },
  { name: "Business Pack 1000 Min", type: "voice", cost: 900, validity: 30, dataQuota: null, voiceQuota: 1000, description: "1000 minutes for business use" },
  { name: "Roaming Calls 50 Min", type: "voice", cost: 300, validity: 30, dataQuota: null, voiceQuota: 50, description: "50 minutes usable while roaming internationally" },
  { name: "Roaming Calls 100 Min", type: "voice", cost: 550, validity: 30, dataQuota: null, voiceQuota: 100, description: "100 minutes usable while roaming internationally" },
  { name: "Emergency Pack 30 Min", type: "voice", cost: 20, validity: 7, dataQuota: null, voiceQuota: 30, description: "30 minutes for emergency calls only" },
  { name: "Premium Calls 200 Min", type: "voice", cost: 400, validity: 30, dataQuota: null, voiceQuota: 200, description: "High-quality call minutes for premium users" },
  { name: "Unlimited Night Calls", type: "voice", cost: 250, validity: 30, dataQuota: null, voiceQuota: "unlimited", description: "Unlimited calls from 12AM-6AM" },
  { name: "Unlimited Weekend Calls", type: "voice", cost: 400, validity: 7, dataQuota: null, voiceQuota: "unlimited", description: "Unlimited calls on weekends" }
];

module.exports = { voicePackages };