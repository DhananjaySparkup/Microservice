const ServiceCharge = require("../models/ServiceCharge");
const parseSlabs = require("../utils/parseSlabs");

exports.assignService = async (req, res) => {
  const { userId, serviceId, slabs } = req.body;
  try {
    const entry = new ServiceCharge({ userId, serviceId, slabs });
    await entry.save();
    res.status(201).json({ message: "Service assigned successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error assigning service", error: err.message });
  }
};

exports.calculateCharge = async (req, res) => {
  const { userId, serviceId, amount } = req.body;

  try {
    const service = await ServiceCharge.findOne({ userId, serviceId });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const charge = parseSlabs(service.slabs, amount);
    if (!charge)
      return res.status(400).json({ message: "No matching slab for amount" });

    res.status(200).json({ serviceCharge: charge });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error calculating charge", error: err.message });
  }
};
