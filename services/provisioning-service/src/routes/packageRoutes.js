// src/routes/packageRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getDataPackages,
    getServicePackages,
    getVoicePackages,
    getAllPackages,
    activatePackage,
    getSinglePackage

} = require('../controllers/packageController');




const router = express.Router();

// Endpoints
router.get("/single-package/:id", protect, getSinglePackage);
router.get('/data', protect, getDataPackages);
router.get('/vas', protect, getServicePackages);
router.get('/voice', protect, getVoicePackages);
router.get('/all', protect, getAllPackages);
router.post('/activate', protect, activatePackage); 



module.exports = router;
