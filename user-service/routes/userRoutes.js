const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createUser } = require('../controllers/userController');

router.post('/', auth, createUser);

module.exports = router;
