const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const gatewayController = require('../controller/gatewayController');

const router = express.Router();

// USER service (public)
router.use('/users', gatewayController.userProxy);

// BILLING service (protected)
// Note: The billing service's /mark-paid endpoint is internal
// It should be protected by gateway secret, not user JWT
router.use('/billing', protect, gatewayController.billingProxy);

// PAYMENT service (protected)
router.use('/payments', protect, gatewayController.paymentProxy);

// PROVISIONING service (protected)
router.use('/provisioning', protect, gatewayController.provisioningProxy);

// Chat Service (protected)
router.use('/api/chat',protect, gatewayController.chatProxy);

module.exports = router;