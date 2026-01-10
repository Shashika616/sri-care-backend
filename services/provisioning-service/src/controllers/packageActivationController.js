const axios = require('axios');
const Package = require('../models/Package');
const User = require('../models/User');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5000';

/**
 * Activate a package for a user
 * Flow:
 * 1. Validate package exists
 * 2. Get package price
 * 3. Verify sufficient balance (from frontend)
 * 4. Deduct amount from wallet
 * 5. Add package to user's active packages
 */
exports.activatePackage = async (req, res) => {
  try {
    const { phoneNumber, packageId, packageType, balance } = req.body;
    const userId = req.userId; // From auth middleware

    // ========== STEP 1: Validate Input ==========
    if (!phoneNumber || !packageId || !packageType || balance === undefined) {
      return res.status(400).json({
        status: 'FAILED',
        message: 'Missing required fields: phoneNumber, packageId, packageType, balance'
      });
    }

    // Validate package type
    const validTypes = ['data', 'voice', 'service'];
    if (!validTypes.includes(packageType)) {
      return res.status(400).json({
        status: 'FAILED',
        message: `Invalid packageType. Must be one of: ${validTypes.join(', ')}`
      });
    }

    console.log(`📦 [Activation] User ${userId} activating ${packageType} package ${packageId}`);
    console.log(`💳 [Activation] Current balance from frontend: LKR ${balance}`);

    // ========== STEP 2: Get Package Details from Database ==========
    const package = await Package.findOne({ 
      packageId: packageId,
      category: packageType,
      isActive: true 
    });

    if (!package) {
      return res.status(404).json({
        status: 'FAILED',
        message: `Package not found or inactive`
      });
    }

    const packageCost = package.cost;
    console.log(`💰 [Activation] Package cost: LKR ${packageCost}`);

    // ========== STEP 3: Verify Sufficient Balance ==========
    if (balance < packageCost) {
      return res.status(400).json({
        status: 'FAILED',
        message: 'Insufficient balance',
        required: packageCost,
        available: balance,
        shortfall: packageCost - balance
      });
    }

    // ========== STEP 4: Deduct Amount from Wallet ==========
    let newBalance;
    try {
      const deductResponse = await axios.post(
        `${GATEWAY_URL}/api/wallet/deduct`,
        {
          amount: packageCost,
          description: `Activated ${package.name}`
        },
        {
          headers: {
            'Authorization': req.headers.authorization,
          }
        }
      );
      newBalance = deductResponse.data.balance;
      console.log(`✅ [Activation] Deducted LKR ${packageCost}. New balance: LKR ${newBalance}`);
    } catch (error) {
      console.error('❌ [Activation] Failed to deduct from wallet:', error.message);
      return res.status(500).json({
        status: 'FAILED',
        message: 'Payment failed. Please try again.',
        error: error.response?.data?.message || error.message
      });
    }

    // ========== STEP 5: Add Package to User's Active Packages ==========
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        console.error('❌ [Activation] User not found after payment!');
        return res.status(404).json({
          status: 'FAILED',
          message: 'User not found'
        });
      }

      // Initialize activePackages if it doesn't exist
      if (!user.activePackages) {
        user.activePackages = { data: [], voice: [], services: [] };
      }

      // Determine expiry date (30 days from now as default)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Add package to appropriate category
      const packageData = {
        packageId: package.packageId,
        name: package.name,
        activatedAt: new Date(),
        expiresAt: expiresAt
      };

      if (packageType === 'data') {
        user.activePackages.data.push(packageData);
      } else if (packageType === 'voice') {
        user.activePackages.voice.push(packageData);
      } else if (packageType === 'service') {
        user.activePackages.services.push(packageData);
      }

      await user.save();
      console.log(`✅ [Activation] Package added to user profile`);

    } catch (error) {
      console.error('❌ [Activation] Failed to update user profile:', error.message);
      return res.status(500).json({
        status: 'FAILED',
        message: 'Package activation failed after payment. Please contact support.'
      });
    }

    // ========== STEP 6: Return Success Response ==========
    res.json({
      status: 'SUCCESS',
      message: `${package.name} activated successfully`,
      package: {
        id: package.packageId,
        name: package.name,
        type: packageType,
        cost: packageCost
      },
      wallet: {
        previousBalance: balance,
        deducted: packageCost,
        newBalance: newBalance
      },
      expiresAt: expiresAt
    });

  } catch (error) {
    console.error('❌ [Activation] Unexpected error:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user's active packages
 */
exports.getActivePackages = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('activePackages');
    
    if (!user) {
      return res.status(404).json({
        status: 'FAILED',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      activePackages: user.activePackages || { data: [], voice: [], services: [] }
    });

  } catch (error) {
    console.error('❌ [Get Packages] Error:', error);
    res.status(500).json({
      status: 'FAILED',
      message: error.message
    });
  }
};