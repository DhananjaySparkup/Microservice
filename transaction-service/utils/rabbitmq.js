const amqplib = require('amqplib');

let channel;

const connect = async () => {
  const connection = await amqplib.connect(process.env.RABBITMQ_URI);
  channel = await connection.createChannel();
  await channel.assertQueue('transaction_queue');
};

const publishToQueue = async (msg) => {
  if (!channel) await connect();
  channel.sendToQueue('transaction_queue', Buffer.from(JSON.stringify(msg)));
};

module.exports = { publishToQueue };
