const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 💾 THE DATABASE
// We start with one, but the code below will ADD new ones automatically!
const simDatabase = {
    "0771234567": { balance: 500.00, roaming: false, activePackages: [] }
};

// --- HELPER FUNCTION: AUTO-CREATE USER ---
// If the phone number doesn't exist, we create a fresh SIM card for it.
const getOrCreateUser = (phone) => {
    if (!simDatabase[phone]) {
        console.log(`🆕 New SIM detected: ${phone}. Creating account...`);
        simDatabase[phone] = { 
            balance: 0.00, // New users start with 0
            roaming: false, 
            activePackages: [] 
        };
    }
    return simDatabase[phone];
};

console.log("-----------------------------------------");
console.log("📡 SMART TELCO NETWORK STARTED");
console.log("-----------------------------------------");

// 1. GET BALANCE
app.get('/api/balance/:phone', (req, res) => {
    const phone = req.params.phone;
    const user = getOrCreateUser(phone); // <--- Auto-create happens here!

    console.log(`🔎 [Network] Balance for ${phone}: ${user.balance}`);
    res.json({ status: "SUCCESS", phone, balance: user.balance });
});

// 2. RELOAD
app.post('/api/reload', (req, res) => {
    const { phone, amount } = req.body;
    const user = getOrCreateUser(phone); // <--- Auto-create happens here!
    
    user.balance += parseFloat(amount);
    console.log(`💰 [Network] Reloaded ${amount} for ${phone}. New Balance: ${user.balance}`);
    res.json({ status: "SUCCESS", currentBalance: user.balance });
});

// 3. ACTIVATE PACKAGE
app.post('/api/package', (req, res) => {
    const { phone, packageName, cost } = req.body;
    const user = getOrCreateUser(phone); // <--- Auto-create happens here!
    
    if (user.balance >= cost) {
        user.balance -= parseFloat(cost);
        user.activePackages.push(packageName);
        console.log(`📦 [Network] Package ${packageName} Activated for ${phone}`);
        res.json({ status: "SUCCESS", message: "Activated", currentBalance: user.balance });
    } else {
        res.status(400).json({ status: "FAILED", message: "Insufficient Balance" });
    }
});

// 4. ROAMING
app.post('/api/roaming', (req, res) => {
    const { phone, status } = req.body;
    const user = getOrCreateUser(phone); // <--- Auto-create happens here!
    
    user.roaming = status;
    const msg = status ? "Enabled" : "Disabled";
    console.log(`✈️ [Network] Roaming ${msg} for ${phone}`);
    res.json({ status: "SUCCESS", message: `Roaming ${msg}` });
});

// Change this line at the bottom:
app.listen(4002, () => {
    console.log('✅ Mock Telco running on: http://localhost:4002');
});