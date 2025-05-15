const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { assignService, calculateCharge } = require('../controllers/serviceController');

router.post('/assign', auth, assignService);
router.post('/calculate', calculateCharge);

module.exports = router;
