// Simulates the external API calls to Email/SMS/Push providers
const sendToExternalProvider = async (channel, recipient, message) => {
    return new Promise((resolve, reject) => {
        // 1. Simulate Network Latency (100ms - 500ms)
        const latency = Math.floor(Math.random() * 400) + 100;

        console.log(`📡 [${channel}] Connecting to provider...`);

        setTimeout(() => {
            // 2. Simulate Random Provider Failures (5% chance of failure)
            // This proves your "Best Effort" logic works
            const isSuccess = Math.random() > 0.05;

            if (isSuccess) {
                console.log(`[${channel}] Delivered to ${recipient}: "${message}"`);
                resolve(true);
            } else {
                console.error(`[${channel}] Provider Failed for ${recipient}`);
                reject(new Error('Gateway Timeout / Provider Error'));
            }
        }, latency);
    });
};

module.exports = { sendToExternalProvider };