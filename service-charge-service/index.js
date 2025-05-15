const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/service', serviceRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Service Charge Service running on port ${PORT}`));
