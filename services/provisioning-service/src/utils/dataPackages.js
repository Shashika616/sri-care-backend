// src/utils/dataPackages.js

const dataPackages = [
  { name: "Data 500MB", type: "data", cost: 50, validity: 7, dataQuota: 500, voiceQuota: null, description: "500MB Internet data valid for 7 days" },
  { name: "Data 1GB", type: "data", cost: 100, validity: 30, dataQuota: 1024, voiceQuota: null, description: "1GB Internet data valid for 30 days" },
  { name: "Data 2GB", type: "data", cost: 180, validity: 30, dataQuota: 2048, voiceQuota: null, description: "2GB Internet data valid for 30 days" },
  { name: "Data 3GB", type: "data", cost: 250, validity: 30, dataQuota: 3072, voiceQuota: null, description: "3GB Internet data valid for 30 days" },
  { name: "Data 5GB", type: "data", cost: 400, validity: 30, dataQuota: 5120, voiceQuota: null, description: "5GB Internet data valid for 30 days" },
  { name: "Data 10GB", type: "data", cost: 750, validity: 30, dataQuota: 10240, voiceQuota: null, description: "10GB Internet data valid for 30 days" },
  { name: "Night Data 1GB", type: "data", cost: 80, validity: 30, dataQuota: 1024, voiceQuota: null, description: "1GB Internet for night usage (12AM-6AM)" },
  { name: "Night Data 2GB", type: "data", cost: 150, validity: 30, dataQuota: 2048, voiceQuota: null, description: "2GB Internet for night usage (12AM-6AM)" },
  { name: "Weekly Data 1GB", type: "data", cost: 60, validity: 7, dataQuota: 1024, voiceQuota: null, description: "1GB weekly Internet data" },
  { name: "Weekly Data 3GB", type: "data", cost: 180, validity: 7, dataQuota: 3072, voiceQuota: null, description: "3GB weekly Internet data" },
  { name: "Monthly Data 5GB", type: "data", cost: 350, validity: 30, dataQuota: 5120, voiceQuota: null, description: "5GB monthly Internet data" },
  { name: "Monthly Data 10GB", type: "data", cost: 650, validity: 30, dataQuota: 10240, voiceQuota: null, description: "10GB monthly Internet data" },
  { name: "Social Pack 1GB", type: "data", cost: 90, validity: 30, dataQuota: 1024, voiceQuota: null, description: "1GB data for social media apps only" },
  { name: "Social Pack 2GB", type: "data", cost: 160, validity: 30, dataQuota: 2048, voiceQuota: null, description: "2GB data for social media apps only" },
  { name: "Streaming Pack 2GB", type: "data", cost: 200, validity: 30, dataQuota: 2048, voiceQuota: null, description: "2GB data for video streaming apps" },
  { name: "Streaming Pack 5GB", type: "data", cost: 450, validity: 30, dataQuota: 5120, voiceQuota: null, description: "5GB data for video streaming apps" },
  { name: "Travel Data 1GB", type: "data", cost: 120, validity: 30, dataQuota: 1024, voiceQuota: null, description: "1GB Internet for travel roaming" },
  { name: "Travel Data 2GB", type: "data", cost: 220, validity: 30, dataQuota: 2048, voiceQuota: null, description: "2GB Internet for travel roaming" },
  { name: "Edu Pack 1GB", type: "data", cost: 80, validity: 30, dataQuota: 1024, voiceQuota: null, description: "1GB data for educational apps" },
  { name: "Edu Pack 3GB", type: "data", cost: 200, validity: 30, dataQuota: 3072, voiceQuota: null, description: "3GB data for educational apps" },
  { name: "Unlimited Night Data", type: "data", cost: 300, validity: 30, dataQuota: "unlimited", voiceQuota: null, description: "Unlimited Internet from 12AM-6AM" },
  { name: "Unlimited Social", type: "data", cost: 250, validity: 30, dataQuota: "unlimited", voiceQuota: null, description: "Unlimited social media apps" },
  { name: "Unlimited Chat Apps", type: "data", cost: 150, validity: 30, dataQuota: "unlimited", voiceQuota: null, description: "Unlimited WhatsApp/Telegram/Signal" },
  { name: "Weekend Data 2GB", type: "data", cost: 100, validity: 7, dataQuota: 2048, voiceQuota: null, description: "2GB data usable only on weekends" },
  { name: "Weekend Data 5GB", type: "data", cost: 220, validity: 7, dataQuota: 5120, voiceQuota: null, description: "5GB data usable only on weekends" }
];

module.exports = { dataPackages };