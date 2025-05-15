const amqp = require('amqplib');
const axios = require('axios');
const mongoose = require('mongoose');
const walletSchema = require('./models/Wallet');
const Transaction = require('./models/Transaction');
const connectUserDB = require('./utils/connectUserDB');

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to Transaction DB');
});

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
  throw new Error("Failed to connect to RabbitMQ after multiple attempts.");
};

const consume = async () => {
  
      try {

        const connection = await connectRabbitMQ();
        const channel = await connection.createChannel();
        await channel.assertQueue('transaction_queue');
        await channel.assertQueue('status_check_queue');

        console.log("Listening to RabbitMQ queue 'transaction_queue'...");

        channel.consume('transaction_queue', async (msg) => {
          const txn = JSON.parse(msg.content.toString());
          console.log('Consuming transaction:', txn._id);

          const { userId, updatedBalance, amount, serviceCharge, gst, _id } = txn;
          const total = amount + serviceCharge + gst;

          try {
            const userDB = await connectUserDB(userId);
            const Wallet = userDB.model('Wallet', walletSchema);
            const wallet = await Wallet.findOne({ userId });

            wallet.balance = +(wallet.balance - total).toFixed(2);
            // await wallet.save();

            // Call Dummy Bank API
            const response = await axios.post(process.env.DUMMY_BANK_API, {
              txnId: _id,
              amount,
              userId,
            });

            const bankStatus = response.data.status;

            if(bankStatus=='Rejected'){
              await Transaction.findByIdAndUpdate(_id, { status: 'failed' });
              wallet.balance += total; // refund
              await wallet.save();
              console.log(`Transaction ${_id} rejected. Amount refunded.`);
            } else if(bankStatus=='Accepted'){
                await Transaction.findByIdAndUpdate(_id, { status: 'accepted' });
                console.log(`Transaction ${_id} accepted. Forwarding to status_check_queue...`);
                channel.sendToQueue('status_check_queue', Buffer.from(JSON.stringify(txn)));
            }

            // await Transaction.findByIdAndUpdate(_id, { status: 'awaited' });

            channel.ack(msg);
          } catch (err) {
            console.error('Processing error:', err.message);
          }
        });
    } catch (err) {
      console.error("RabbitMQ connection failed:", err.message);
    }
  
 
};

// (async () => {
//   await consume();
// })();
consume();
