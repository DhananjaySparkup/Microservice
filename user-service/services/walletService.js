const walletSchema = require('../models/Wallet');

exports.initWallet = async (userDB, userId) => {
  const Wallet = userDB.model('Wallet', walletSchema);
  const wallet = new Wallet({
    userId,
    balance: 10000,
    hold: 100,
    minLimit: 50,
    maxLimit: 5000,
    lean: 200
  });
  await wallet.save();
};
