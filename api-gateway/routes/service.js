const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/authMiddleware");

router.post("/assign", auth, async (req, res) => {
  try {
    const { data } = await axios.post(
      `${process.env.SERVICE_CHARGE_SERVICE}/api/service/assign`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

router.post("/calculate", auth, async (req, res) => {
  try {
    const { data } = await axios.post(
      `${process.env.SERVICE_CHARGE_SERVICE}/api/service/calculate`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
