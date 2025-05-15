const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/login', async (req, res) => {
  try {
    const { data } = await axios.post(`${process.env.AUTH_SERVICE}/api/auth/login`, req.body);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { data } = await axios.post(`${process.env.AUTH_SERVICE}/api/auth/create`, req.body);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
