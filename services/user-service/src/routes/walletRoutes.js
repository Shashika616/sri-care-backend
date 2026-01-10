const express = require('express');
const router = express.Router();
const { topUpWallet } = require('../controllers/walletController');


router.post('/topup', topUpWallet);

module.exports = router;
