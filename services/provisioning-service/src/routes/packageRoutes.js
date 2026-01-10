// src/routes/packageRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getDataPackages,
    getServicePackages,
    getVoicePackages,
    getAllPackages,

} = require('../controllers/packageController');


// const {
//     activatePackage,
//     getActivePackages
// }= require('../controllers/packageActivationController');

const router = express.Router();

// Endpoints
router.get('/data', protect, getDataPackages);
router.get('/vas', protect, getServicePackages);
router.get('/voice', protect, getVoicePackages);
router.get('/all', protect, getAllPackages);
// Activate a package
// router.post('/activate', protect, activatePackage);
// // Get user's active packages
// router.get('/my-packages', protect, getActivePackages);



module.exports = router;
