// src/controllers/packageController.js
const Package = require('../models/Package'); // Your Mongoose model

// Send only data packages
exports.getDataPackages = async (req, res) => {
  try {
    const dataPackages = await Package.find({ type: 'data' }).lean();
    res.json({ status: "SUCCESS", packages: dataPackages });
  } catch (error) {
    console.error('Error fetching data packages:', error);
    res.status(500).json({ status: "ERROR", message: "Failed to fetch data packages" });
  }
};

// Send only service packages (VAS)
exports.getServicePackages = async (req, res) => {
  try {
    const servicePackages = await Package.find({ type: 'VAS' }).lean();
    res.json({ status: "SUCCESS", packages: servicePackages });
  } catch (error) {
    console.error('Error fetching service packages:', error);
    res.status(500).json({ status: "ERROR", message: "Failed to fetch service packages" });
  }
};

// Send only voice packages
exports.getVoicePackages = async (req, res) => {
  try {
    const voicePackages = await Package.find({ type: 'voice' }).lean();
    res.json({ status: "SUCCESS", packages: voicePackages });
  } catch (error) {
    console.error('Error fetching voice packages:', error);
    res.status(500).json({ status: "ERROR", message: "Failed to fetch voice packages" });
  }
};

// Send all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().lean();
    res.json({ status: "SUCCESS", packages });
  } catch (error) {
    console.error('Error fetching all packages:', error);
    res.status(500).json({ status: "ERROR", message: "Failed to fetch packages" });
  }
};