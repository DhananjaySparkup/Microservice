const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: Number,
  serviceCharge: Number,
  gst: Number,
  userId: String,
  prevBalance: Number,
  updatedBalance: Number,
  serviceId: String,
  status: { type: String, enum: [
      'initiated',     // created
      'accepted',      // accepted by bank
      'rejected',      // rejected by bank
      'pending',       // waiting for final bank confirmation
      'success',       // confirmed
      'failed',        // final failure
      'callback_sent'  // final confirmation sent to client
    ],
    default: 'initiated' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
