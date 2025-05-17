const mongoose = require('mongoose');

const dbCache = new Map(); // safer than plain object
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5, // limit per user DB to avoid exhaustion
};

const connectUserDB = async (userId) => {
  const dbUri = `${process.env.MONGO_URI_PREFIX}${userId}`;

  if (dbCache.has(dbUri)) {
    return dbCache.get(dbUri);
  }

  try {
    const conn = await mongoose.createConnection(dbUri, options).asPromise();
    dbCache.set(dbUri, conn);
    console.log(`Connected to DB: sparkup_${userId}`);
    return conn;
  } catch (err) {
    console.error(`Failed to connect to DB for user ${userId}:`, err.message);
    throw err;
  }
};

module.exports = connectUserDB;
