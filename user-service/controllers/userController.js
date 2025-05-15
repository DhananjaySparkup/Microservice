const User = require('../models/User');
const { createUserDB } = require('../services/dbService');
const { initWallet } = require('../services/walletService');


exports.createUser = async (req, res) => {

  const { name, email, mobile,userId} = req.body;

  try {
    const existing = await User.findOne({ userId });
    console.log("Existing User- ",existing);
    
    if (existing) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    const user = new User({ name, email, mobile, userId });
    await user.save();

    const userDB = await createUserDB(userId);
    await initWallet(userDB, userId);

    res.status(201).json({ message: 'User and DB created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};
