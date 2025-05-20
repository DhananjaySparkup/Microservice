const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  try {
    const { data } = await axios.post(
      `${process.env.TRANSACTION_SEND_SERVICE}/api/send-transaction`,
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
