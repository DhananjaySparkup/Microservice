const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  userId: String,
  serviceId: String,
  slabs: String
});

module.exports = mongoose.model('ServiceCharge', serviceSchema);
