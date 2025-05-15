const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const walletRoutes = require('./routes/walletRoutes');
app.use('/api/wallet', walletRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Wallet Service running on port ${PORT}`));
