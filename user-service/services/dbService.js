const mongoose = require('mongoose');

exports.createUserDB = async (userId) => {
  const dbName = `${process.env.MONGO_URI_PREFIX}${userId}`;
  const conn = await mongoose.createConnection(dbName).asPromise();
  console.log(`Connected to DB: sparkup_${userId}`);
  return conn;
};
