const amqp = require("amqplib");
const mongoose = require("mongoose");
const Transaction = require("./models/Transaction");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to transactionDB");
});

const consumeCallback = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await conn.createChannel();
  await channel.assertQueue("callback_queue");

  console.log("Listening to 'callback_queue'...");

  channel.consume("callback_queue", async (msg) => {
    const { _id, userId } = JSON.parse(msg.content.toString());

    try {
      await Transaction.findByIdAndUpdate(_id, {
        status: "callback_sent",
      });
      console.log(`Callback sent for transaction ${_id} (user: ${userId})`);

      // Optional: simulate HTTP callback
      // await axios.post('http://external-client/callback', { txnId: _id });

      channel.ack(msg);
    } catch (err) {
      console.error("Failed to handle callback:", err.message);
      // channel.nack(msg)
    }
  });
};

consumeCallback();
