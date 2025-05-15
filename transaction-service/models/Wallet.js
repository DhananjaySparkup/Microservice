const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: String,
  balance: Number,
  hold: Number,
  minLimit: Number,
  maxLimit: Number,
  lean: Number
});

module.exports = walletSchema;
