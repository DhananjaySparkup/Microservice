const amqp = require("amqplib");
const axios = require("axios");
const mongoose = require("mongoose");
const walletSchema = require("./models/Wallet");
const Transaction = require("./models/Transaction");
const connectUserDB = require("./utils/connectUserDB");

require("dotenv").config();

// Connect to Transaction DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to Transaction DB"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

const connectRabbitMQ = async () => {
  let retries = 10;
  while (retries) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URI);
      console.log("Connected to RabbitMQ");
      return conn;
    } catch (err) {
      console.warn("RabbitMQ not ready, retrying in 5s...");
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  throw new Error("Failed to connect to RabbitMQ after multiple attempts.");
};

const consume = async () => {
  try {
    const connection = await connectRabbitMQ();
    const channel = await connection.createChannel();

    await channel.assertQueue("transaction_queue");
    await channel.assertQueue("status_check_queue");

    channel.prefetch(1);
    console.log("Listening to 'transaction_queue'...");

    channel.consume("transaction_queue", async (msg) => {
      const txn = JSON.parse(msg.content.toString());
      console.log(`Consuming transaction: ${txn._id}`);

      const { userId, amount, serviceCharge, gst, _id } = txn;
      const total = amount + serviceCharge + gst;

      try {
        const userDB = await connectUserDB(userId);
        const Wallet = userDB.model("Wallet", walletSchema);
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
          throw new Error(`Wallet not found for userId: ${userId}`);
        }

        // Simulate external bank call
        const response = await axios.post(process.env.DUMMY_BANK_API, {
          txnId: _id,
          amount,
          userId,
        });

        const bankStatus = response?.data?.status;
        console.log(`Bank status for txn ${_id}: ${bankStatus}`);

        if (bankStatus === "Rejected") {
          await Transaction.findByIdAndUpdate(_id, { status: "failed" });
          wallet.balance += total;
          await wallet.save();
          console.log(
            ` Transaction ${_id} rejected. Refunded amount. New balance: ${wallet.balance}`
          );
        } else if (bankStatus === "Accepted") {
          wallet.balance = +(wallet.balance - total).toFixed(2);
          await wallet.save();
          await Transaction.findByIdAndUpdate(_id, { status: "accepted" });
          console.log(
            `Transaction ${_id} accepted. Forwarding to status_check_queue...`
          );
          channel.sendToQueue(
            "status_check_queue",
            Buffer.from(JSON.stringify(txn))
          );
        } else {
          throw new Error(`Unknown bank status: ${bankStatus}`);
        }

        channel.ack(msg);
      } catch (err) {
        console.error(` Error processing txn ${txn._id}:`, err.message);
        channel.nack(msg, false, false); // reject and discard the message
      }
    });
  } catch (err) {
    console.error(" Fatal RabbitMQ connection error:", err.message);
    process.exit(1);
  }
};

// Handle uncaught errors gracefully
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

consume();
