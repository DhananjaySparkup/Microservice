const mongoose = require('mongoose');

const connectUserDB = async (userId) => {
  const dbName = `sparkup_${userId}`;
  const conn = mongoose.connection.useDb(dbName);
  return conn;
};

module.exports = connectUserDB;
