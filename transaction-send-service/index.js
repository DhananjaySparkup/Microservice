const express = require('express');
const app = express();
const sendTransactionRoutes = require('./routes/sendTransactionRoutes');

app.use(express.json());
app.use('/api/send-transaction', sendTransactionRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`Transaction Send Service running on port ${PORT}`);
});