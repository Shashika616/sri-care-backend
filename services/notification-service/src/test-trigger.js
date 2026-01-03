const amqp = require('amqplib');

(async () => {
    const conn = await amqp.connect('amqp://localhost');
    const ch = await conn.createChannel();
    const ex = 'sricare_events';

    await ch.assertExchange(ex, 'topic', { durable: true });

    const STLBILL = {
        userId: "u12345",
        email: "ashanjr.research@gmail.com",
        phone: "+18777804236",
        message: "Your bill of 1500 LKR is ready.",
        timestamp: new Date()
    };

    console.log("Publishing Mock Bill Event...");
    ch.publish(ex, 'billing.generated', Buffer.from(JSON.stringify(STLBILL)));

    setTimeout(() => { conn.close(); process.exit(0); }, 500);
})();