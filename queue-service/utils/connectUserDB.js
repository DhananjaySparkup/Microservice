const mongoose = require("mongoose");

const dbCache = {};
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectUserDB = async (userId) => {
  if (dbCache[userId]) return dbCache[userId];

  const conn = await mongoose.createConnection(
    `${process.env.MONGO_URI_PREFIX}${userId}`,
    options
  );
  dbCache[userId] = conn;
  return conn;
};

module.exports = connectUserDB;
