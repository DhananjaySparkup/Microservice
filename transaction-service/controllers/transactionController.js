const axios = require('axios');
const Transaction = require('../models/Transaction');
const { publishToQueue } = require('../utils/rabbitmq');
const connectUserDB = require('../utils/connectUserDB');
const walletSchema = require('../models/Wallet'); // reused from earlier

exports.createTransaction = async (req, res) => {
  const { userId, amount, serviceId } = req.body;
  console.log("Body Data -",req.body);

  try {
    // Get service charge
    const { data } = await axios.post(process.env.SERVICE_CHARGE_URL, {
      userId, serviceId, amount
    });
    console.log("Data - ",data);
    
    const serviceCharge = data.serviceCharge;
    const gst = +(serviceCharge * 0.18).toFixed(2);
    const total = amount + serviceCharge + gst;

    // Connect to user's wallet DB
    const userDB = await connectUserDB(userId);
    const Wallet = userDB.model('Wallet', walletSchema);
    const wallet = await Wallet.findOne({ userId });

    const availableBalance = wallet.balance - wallet.hold;
    if (amount < wallet.minLimit || amount > wallet.maxLimit || availableBalance < total) {
      return res.status(400).json({ message: 'Wallet validation failed' });
    }

    const prevBalance = wallet.balance;
    const updatedBalance = +(wallet.balance - total).toFixed(2);
    console.log("Updated Balance -",updatedBalance);
    

    const transaction = new Transaction({
      amount,
      serviceCharge,
      gst,
      userId,
      serviceId,
      prevBalance,
      updatedBalance,
      status: 'initiated'
    });

    await transaction.save();

    const queue = await publishToQueue(transaction);
    console.log("Queue - ",queue);
    
    res.status(201).json({ message: 'Transaction initiated', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Transaction error', error: err.message });
  }
};
