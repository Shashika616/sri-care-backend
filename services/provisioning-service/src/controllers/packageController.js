// src/controllers/packageController.js
const Package = require('../models/Package'); // Your Mongoose model
const axios = require('axios');



// Get user-service URL from env (with fallback)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';



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




// src/controllers/packageController.js
exports.getSinglePackage = async (req, res) => {
  // ✅ Sanitize ID: remove non-hex characters
  const rawId = req.params.id;
  const cleanId = rawId.replace(/[^a-fA-F0-9]/g, '');

  // Validate cleaned ID
  if (cleanId.length !== 24) {
    return res.status(400).json({
      status: "ERROR",
      message: "Invalid package ID format"
    });
  }

  try {
    const packageDoc = await Package.findById(cleanId);
    
    if (!packageDoc) {
      return res.status(404).json({
        status: "ERROR",
        message: "Package not found"
      });
    }

    res.json({
      status: "SUCCESS",
      package: packageDoc
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      status: "ERROR",
      message: "Server error"
    });
  }
};


// src/controllers/packageController.js

exports.activatePackage = async (req, res) => {
  // ✅ Get userId from middleware (not req.user.id)
  const userId = req.userId; // ← This is set by your protect middleware
  const { balance, packageId } = req.body;

  if (balance === undefined || !packageId) {
    return res.status(400).json({
      status: "ERROR",
      message: "balance and packageId are required"
    });
  }

  let packageDoc;
  try {
    packageDoc = await Package.findById(packageId);
    if (!packageDoc) {
      return res.status(404).json({
        status: "ERROR",
        message: "Package not found"
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Database error"
    });
  }

  if (balance < packageDoc.cost) {
    return res.status(400).json({
      status: "ERROR",
      message: "Insufficient balance"
    });
  }

  try {
    const deductionPayload = {
      userId: userId, // ← From middleware
      amount: -packageDoc.cost,
      voice: packageDoc.voiceQuota === 'unlimited' ? 0 : (packageDoc.voiceQuota || 0),
      data: packageDoc.dataQuota === 'unlimited' ? 0 : (packageDoc.dataQuota || 0)
    };

    await axios.post(`${USER_SERVICE_URL}/api/wallet/topup`, deductionPayload, {
      timeout: 5000
    });

    return res.json({
      status: "SUCCESS",
      message: "Package activated successfully",
      package: packageDoc
    });
  } catch (error) {
    console.error('User service error:', error.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Failed to activate package"
    });
  }
};