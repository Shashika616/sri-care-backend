// src/utils/database.js
const users = {};

function getOrCreateUser(phone) {
  if (!users[phone]) {
    users[phone] = {
      phone,
      balance: 0,
      activePackages: [],
      roaming: false
    };
  }
  return users[phone];
}

module.exports = { getOrCreateUser };  // ✅ must be an object with named property
