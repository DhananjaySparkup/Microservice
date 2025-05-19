const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { publishTransaction } = require('../controllers/transactionSendController');

router.post('/', auth, publishTransaction);

module.exports = router;