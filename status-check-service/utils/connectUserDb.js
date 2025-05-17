// connectUserDB.js
const mongoose = require('mongoose');
const dbCache = new Map();

function connectUserDB(userId) {
  const dbName = `sparkup_${userId}`;
  if (dbCache.has(dbName)) {
    return dbCache.get(dbName);
  }
  const db = mongoose.connection.useDb(dbName, { useCache: true });
  dbCache.set(dbName, db);
  return db;
}

module.exports = connectUserDB;
