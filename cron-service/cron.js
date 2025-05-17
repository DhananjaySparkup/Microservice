const cron = require('node-cron');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Transaction = require('./models/Transaction');

connectDB();

// Run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running cron to update transactions...');

  try {
    const result = await Transaction.updateMany(
      { status: 'awaited' },
      { $set: { status: 'success' } }
    );

    console.log(`Updated ${result.modifiedCount} transactions to 'success'`);
  } catch (err) {
    console.error('Error updating transactions:', err.message);
  }
});
