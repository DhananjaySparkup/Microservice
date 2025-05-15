const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { topUpWallet } = require('../controllers/walletController');

router.post('/topup', auth, topUpWallet);

module.exports = router;
