const { getOrCreateUser } = require('../utils/database');

// 1. Get Balance
exports.getBalance = (req, res) => {
  const phone = req.params.phone;
  const user = getOrCreateUser(phone);
  console.log(`🔎 Balance for ${phone}: ${user.balance}`);
  res.json({ status: "SUCCESS", phone, balance: user.balance });
};

// 2. Reload Balance
exports.reloadBalance = (req, res) => {
  const { phone, amount } = req.body;
  const user = getOrCreateUser(phone);
  user.balance += parseFloat(amount);
  console.log(`💰 Reloaded ${amount} for ${phone}. New Balance: ${user.balance}`);
  res.json({ status: "SUCCESS", currentBalance: user.balance });
};

// 3. Activate Package
exports.activatePackage = (req, res) => {
  const { phone, packageName, cost } = req.body;
  const user = getOrCreateUser(phone);

  if (user.balance >= cost) {
    user.balance -= parseFloat(cost);
    user.activePackages.push(packageName);
    console.log(`📦 Package ${packageName} Activated for ${phone}`);
    res.json({ status: "SUCCESS", message: "Activated", currentBalance: user.balance });
  } else {
    res.status(400).json({ status: "FAILED", message: "Insufficient Balance" });
  }
};

// 4. Toggle Roaming
exports.toggleRoaming = (req, res) => {
  const { phone, status } = req.body;
  const user = getOrCreateUser(phone);
  user.roaming = status;
  const msg = status ? "Enabled" : "Disabled";
  console.log(`✈️ Roaming ${msg} for ${phone}`);
  res.json({ status: "SUCCESS", message: `Roaming ${msg}` });
};
