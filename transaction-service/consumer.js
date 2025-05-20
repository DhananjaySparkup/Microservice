const amqp = require("amqplib");
const axios = require("axios");
const mongoose = require("mongoose");
const walletSchema = require("./models/Wallet");
const Transaction = require("./models/Transaction");
const connectUserDB = require("./utils/connectUserDB");

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to Transaction DB");
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
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  throw new Error("Failed to connect to RabbitMQ after multiple attempts.");
};

const consume = async () => {
  try {
    const connection = await connectRabbitMQ();
    const channel = await connection.createChannel();
    await channel.assertQueue("transaction_send_queue");
    await channel.assertQueue("transaction_queue");

    channel.prefetch(1);
    console.log("Listening to RabbitMQ queue 'transaction_send_queue'...");

    channel.consume("transaction_send_queue", async (msg) => {
      const txnData = JSON.parse(msg.content.toString());
      const { userId, amount, serviceId } = txnData;
      console.log("Received transaction request for user:", userId);

      const MAX_RETRIES = 5;
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        const session = await mongoose.startSession();
        try {
          session.startTransaction();

          // Get service charges
          const { data } = await axios.post(process.env.SERVICE_CHARGE_URL, {
            userId,
            serviceId,
            amount,
          });

          const serviceCharge = data.serviceCharge;
          const gst = +(serviceCharge * 0.18).toFixed(2);
          const total = +(amount + serviceCharge + gst).toFixed(2);

          const userDB = await connectUserDB(userId);
          const Wallet = userDB.model("Wallet", walletSchema);

          const wallet = await Wallet.findOneAndUpdate(
            {
              userId,
              balance: { $gte: total },
              minLimit: { $lte: amount },
              maxLimit: { $gte: amount },
            },
            { $inc: { balance: -total } },
            { session, new: true }
          );

          if (!wallet) {
            await session.abortTransaction();
            session.endSession();
            console.warn(
              `Wallet validation failed or insufficient balance for user ${userId}`
            );
            channel.ack(msg);
            return;
          }

          const prevBalance = +(wallet.balance + total).toFixed(2);
          const updatedBalance = wallet.balance;

          const transaction = new Transaction({
            amount,
            serviceCharge,
            gst,
            userId,
            serviceId,
            prevBalance,
            updatedBalance,
            status: "initiated",
          });

          await transaction.save({ session });

          await session.commitTransaction();
          session.endSession();

          console.log(`Transaction ${transaction._id} created successfully.`);

          //  Publish to transaction_queue
          const txnToSend = {
            _id: transaction._id,
            userId,
            amount,
            serviceCharge,
            gst,
            prevBalance,
            updatedBalance,
            serviceId,
          };

          channel.sendToQueue(
            "transaction_queue",
            Buffer.from(JSON.stringify(txnToSend))
          );
          console.log(
            `Sent transaction ${transaction._id} to 'transaction_queue'`
          );

          channel.ack(msg);
          return;
        } catch (err) {
          attempt++;
          await session.abortTransaction().catch(() => {});
          session.endSession();

          const msgText = err?.message || "";
          const isRetryable =
            msgText.includes("Write conflict") ||
            (err.errorLabels &&
              err.errorLabels.includes("TransientTransactionError"));

          console.warn(`Attempt ${attempt} failed:`, msgText);

          if (isRetryable) {
            await new Promise((res) => setTimeout(res, 100 * attempt)); // backoff
            continue;
          }

          console.error(`Transaction processing failed: ${msgText}`);
          channel.ack(msg); // Prevent infinite retries on unrecoverable error
          return;
        }
      }

      console.error(`Transaction failed after ${MAX_RETRIES} retries.`);
      channel.ack(msg);
    });
  } catch (err) {
    console.error("RabbitMQ connection failed:", err.message);
  }
};

consume();
