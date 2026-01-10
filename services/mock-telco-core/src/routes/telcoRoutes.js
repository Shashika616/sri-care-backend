const express = require('express');
const router = express.Router();
const telcoController = require('../controllers/telcoController');

// Define all the Mock Telco endpoints
router.get('/balance/:phone', telcoController.getBalance);
router.post('/reload', telcoController.reloadBalance);
router.post('/package', telcoController.activatePackage);
router.post('/roaming', telcoController.toggleRoaming);

module.exports = router;