const mongoose = require('mongoose');

const dbCache = {};
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const connectUserDB = async (userId) => {
  if (dbCache[userId]) return dbCache[userId];

  const connUri = `${process.env.MONGO_URI_PREFIX}${userId}`;
  const conn = mongoose.createConnection(connUri, options);

  // Wait until connected
  await new Promise((resolve, reject) => {
    conn.once('connected', () => {
      console.log(`[Mongo] Connected to user DB: ${userId}`);
      resolve();
    });
    conn.on('error', (err) => {
      console.error(`[Mongo] Error connecting to user DB ${userId}:`, err);
      reject(err);
    });
  });

  dbCache[userId] = conn;
  return conn;
};

module.exports = connectUserDB;