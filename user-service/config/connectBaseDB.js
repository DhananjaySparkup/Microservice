const mongoose = require('mongoose');

const connectBaseDB = async () => {
  try {
    await mongoose.connect(process.env.BASE_DB_URI);
    console.log('Connected to baseDB');
  } catch (err) {
    console.error('Base DB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectBaseDB;
