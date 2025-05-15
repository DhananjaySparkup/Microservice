const mongoose = require('mongoose');

const connectUserDB = async (userId) => {
  const uri = `${process.env.MONGO_URI_PREFIX}${userId}`;
  const conn = await mongoose.createConnection(uri).asPromise();
  return conn;
};

module.exports = connectUserDB;
