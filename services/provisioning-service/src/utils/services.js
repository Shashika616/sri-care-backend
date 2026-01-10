// src/utils/services.js

const services = [
  { name: "Roaming", type: "VAS", cost: 500, validity: 30, dataQuota: null, voiceQuota: null, description: "International roaming service" },
  { name: "RingTone", type: "VAS", cost: 50, validity: 30, dataQuota: null, voiceQuota: null, description: "Personalised ring tone service" },
  { name: "Call Forwarding", type: "VAS", cost: 30, validity: 30, dataQuota: null, voiceQuota: null, description: "Forward calls to another number" },
  { name: "Caller Tune", type: "VAS", cost: 40, validity: 30, dataQuota: null, voiceQuota: null, description: "Set custom caller tunes" },
  { name: "Voicemail", type: "VAS", cost: 20, validity: 30, dataQuota: null, voiceQuota: null, description: "Receive voicemail messages" },
  { name: "Missed Call Alert", type: "VAS", cost: 15, validity: 30, dataQuota: null, voiceQuota: null, description: "Receive SMS alert for missed calls" },
  { name: "International Calls Pack", type: "VAS", cost: 200, validity: 30, dataQuota: null, voiceQuota: null, description: "Discounted international call rates" },
  { name: "Data Boost", type: "VAS", cost: 100, validity: 7, dataQuota: null, voiceQuota: null, description: "Temporary extra data for emergencies" },
  { name: "Premium SMS Pack", type: "VAS", cost: 25, validity: 30, dataQuota: null, voiceQuota: null, description: "Send premium SMS messages" },
  { name: "Unlimited Calls Pack", type: "VAS", cost: 350, validity: 30, dataQuota: null, voiceQuota: null, description: "Unlimited local calls for 30 days" },
  { name: "Roaming SMS Pack", type: "VAS", cost: 80, validity: 30, dataQuota: null, voiceQuota: null, description: "Send SMS while roaming internationally" },
  { name: "Family Pack", type: "VAS", cost: 400, validity: 30, dataQuota: null, voiceQuota: null, description: "Share data and calls among family members" },
  { name: "Weekend Calls Pack", type: "VAS", cost: 150, validity: 7, dataQuota: null, voiceQuota: null, description: "Unlimited calls on weekends" },
  { name: "Music Streaming Pack", type: "VAS", cost: 120, validity: 30, dataQuota: null, voiceQuota: null, description: "Listen to music apps without using data balance" },
  { name: "Video Streaming Pack", type: "VAS", cost: 200, validity: 30, dataQuota: null, voiceQuota: null, description: "Watch video apps without using data balance" },
  { name: "Sports Alerts Pack", type: "VAS", cost: 30, validity: 30, dataQuota: null, voiceQuota: null, description: "Receive SMS alerts about sports scores" },
  { name: "News Alerts Pack", type: "VAS", cost: 20, validity: 30, dataQuota: null, voiceQuota: null, description: "Receive SMS alerts for news updates" },
  { name: "Premium Roaming Pack", type: "VAS", cost: 600, validity: 30, dataQuota: null, voiceQuota: null, description: "High-speed roaming with unlimited calls" },
  { name: "Social Media Pack", type: "VAS", cost: 50, validity: 30, dataQuota: null, voiceQuota: null, description: "Unlimited social media access" },
  { name: "Education Pack", type: "VAS", cost: 40, validity: 30, dataQuota: null, voiceQuota: null, description: "Access to educational websites/apps" },
  { name: "Gaming Pack", type: "VAS", cost: 60, validity: 30, dataQuota: null, voiceQuota: null, description: "Access gaming servers without data charge" },
  { name: "Kids Pack", type: "VAS", cost: 30, validity: 30, dataQuota: null, voiceQuota: null, description: "Content safe for kids" },
  { name: "Weather Alerts Pack", type: "VAS", cost: 15, validity: 30, dataQuota: null, voiceQuota: null, description: "Get weather alerts via SMS" },
  { name: "Health Pack", type: "VAS", cost: 25, validity: 30, dataQuota: null, voiceQuota: null, description: "Health-related notifications" },
  { name: "Festival Pack", type: "VAS", cost: 100, validity: 7, dataQuota: null, voiceQuota: null, description: "Special offers during festival seasons" }
];

module.exports = { services };