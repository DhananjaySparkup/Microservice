const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transaction', transactionRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Transaction Service running on port ${PORT}`));
