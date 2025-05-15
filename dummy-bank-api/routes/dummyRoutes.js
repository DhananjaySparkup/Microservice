const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { txnId, amount, userId } = req.body;
  console.log(`Received transaction for ${userId}, txnId: ${txnId}, amount: ${amount}`);
  
  // Simulate delay or logging if needed
  const statuses = ['Accepted', 'Rejected'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return res.status(200).json({ status: randomStatus });
});

module.exports = router;
