const express = require('express');
const dotenv = require('dotenv');
const connectBaseDB = require('./config/connectBaseDB');

dotenv.config();
connectBaseDB();

const app = express();
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
