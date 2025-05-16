const amqp = require('amqplib');
const mongoose = require('mongoose');
const connectUserDB = require('./utils/connectUserDb');
const walletSchema = require('./utils/walletSchema');
const Transaction = require('./models/Transaction');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to transactionDB');
});

const statuses = ['pending', 'success', 'fail'];

const connectRabbitMQ = async () => {
  let retries = 10;
  while (retries) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URI);
      console.log("Connected to RabbitMQ");
      return conn;
    } catch (err) {
      console.log("RabbitMQ not ready, retrying in 5s...");
      retries--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  throw new Error("Failed to connect to RabbitMQ.");
};

const consumeStatusCheck = async () => {
  const conn = await connectRabbitMQ();
  const channel = await conn.createChannel();

  await channel.assertQueue('status_check_queue');
  await channel.assertQueue('callback_queue');

  console.log("Listening to 'status_check_queue'...");

  channel.consume('status_check_queue', async (msg) => {
    const txn = JSON.parse(msg.content.toString());
    const { _id, userId, amount, serviceCharge, gst } = txn;
    const total = amount + serviceCharge + gst;

    // Simulate random final status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    console.log(`Checked status for ${_id}: ${status}`);

    const userDB = await connectUserDB(userId);
    const Wallet = userDB.model('Wallet', walletSchema);
    const wallet = await Wallet.findOne({ userId });

    if (status === 'success') {
      await Transaction.findByIdAndUpdate(_id, { status: 'success' });
      channel.sendToQueue('callback_queue', Buffer.from(JSON.stringify({ _id, userId })));
    } else if (status === 'fail') {
       
      await Transaction.findByIdAndUpdate(_id, { status: 'failed' });
      wallet.balance += total;
      await wallet.save();
      console.log("Get-Wallet Balance",wallet.balance);
      console.log(`Transaction ${_id} failed. Refunded ${total}.`);
    } else {
      // pending — requeue to simulate polling
      console.log(`Transaction ${_id} still pending. Requeuing...`);
      setTimeout(() => {
        channel.sendToQueue('status_check_queue', Buffer.from(JSON.stringify(txn)));
      }, 5000);
    }

    channel.ack(msg);
  });
};

consumeStatusCheck();
