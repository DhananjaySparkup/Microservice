const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();
app.use(express.json());

const dummyRoutes = require('./routes/dummyRoutes');
app.use('/api/dummy', dummyRoutes);

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => console.log(`Dummy Bank API running on port ${PORT}`));
