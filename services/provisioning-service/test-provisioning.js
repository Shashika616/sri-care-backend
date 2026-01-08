const axios = require('axios');

const SERVICE_URL = 'http://localhost:3007/provision';
const PHONE = '0771234567'; // Valid User in Mock DB

async function runTests() {
    console.log("🚀 STARTING PROVISIONING TESTS...\n");

    try {
        // 1. Check Initial Balance
        console.log("1️⃣  Checking Initial Balance...");
        let res = await axios.get(`${SERVICE_URL}/balance/${PHONE}`);
        console.log(`   ✅ Balance: ${res.data.balance} LKR`);

        // 2. Reload 500 LKR
        console.log("\n2️⃣  Reloading 500 LKR...");
        res = await axios.post(`${SERVICE_URL}/reload`, { phone: PHONE, amount: 500 });
        console.log(`   ✅ New Balance: ${res.data.currentBalance} LKR`);

        // 3. Activate Data Package (Cost 200)
        console.log("\n3️⃣  Activating 'Youtube-Pack' (Cost: 200)...");
        res = await axios.post(`${SERVICE_URL}/package`, { phone: PHONE, packageName: "Youtube-Pack", cost: 200 });
        console.log(`   ✅ Status: ${res.data.message}`);
        console.log(`   💰 Remaining Balance: ${res.data.currentBalance} LKR`);

        // 4. Enable Roaming
        console.log("\n4️⃣  Enabling Roaming...");
        res = await axios.post(`${SERVICE_URL}/roaming`, { phone: PHONE, status: true });
        console.log(`   ✅ ${res.data.message}`);

    } catch (error) {
        console.error("❌ TEST FAILED:", error.response ? error.response.data : error.message);
    }
}

runTests();