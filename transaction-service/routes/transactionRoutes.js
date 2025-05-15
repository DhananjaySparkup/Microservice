const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createTransaction } = require('../controllers/transactionController');

router.post('/', auth, createTransaction);

module.exports = router;
