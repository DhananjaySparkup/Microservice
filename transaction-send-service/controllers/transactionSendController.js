const axios = require("axios");
const { publishToQueue } = require("../utils/rabbitmq");

exports.publishTransaction = async (req, res) => {
  const { userId, amount, serviceId } = req.body;

  if (!userId || !amount || !serviceId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const payload = { userId, amount, serviceId };

  try {
    await publishToQueue(payload);
    console.log("Payload Accepted");

    return res
      .status(202)
      .json({ message: "Transaction request accepted", payload });
  } catch (err) {
    console.error("Failed to publish transaction:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
