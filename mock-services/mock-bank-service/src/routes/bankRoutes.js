const express = require('express');
const router = express.Router();
const { validateCard, verifyOtp, getBalance, rollbackTransaction } = require('../controllers/bankController');

router.post('/validate-card', validateCard);
router.post('/verify-otp', verifyOtp);
router.get('/balance/:cardNumber', getBalance);
router.post('/rollback', rollbackTransaction);


module.exports = router;
