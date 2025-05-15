const connectUserDB = require('../config/connectUserDB');
const walletSchema = require('../models/Wallet');
const { applyTopUpRules } = require('../services/walletLogic');

exports.topUpWallet = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const userDB = await connectUserDB(userId);
    const Wallet = userDB.model('Wallet', walletSchema);
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const updated = applyTopUpRules(wallet, amount);
    await Wallet.findOneAndUpdate({ userId }, updated);

    res.status(200).json({ message: 'Wallet topped up', updated });
  } catch (err) {
    res.status(500).json({ message: 'Top-up error', error: err.message });
  }
};
