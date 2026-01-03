const amqp = require('amqplib');
const { enqueueNotification } = require('../queues/notificationQueue');

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const exchange = 'sricare_events';

        // Assert Exchange (Topic Type)
        await channel.assertExchange(exchange, 'topic', { durable: true });

        // Create Temporary Queue
        const q = await channel.assertQueue('', { exclusive: true });

        // Bind to events we care about
        channel.bindQueue(q.queue, exchange, 'billing.generated');
        channel.bindQueue(q.queue, exchange, 'payment.success');
        channel.bindQueue(q.queue, exchange, 'service.activated');

        console.log('🐰 [EventBus] Waiting for events...');

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const data = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;
                
                console.log(`⚡ [EventBus] Received: ${routingKey}`);
                
                handleEvent(routingKey, data);
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('RabbitMQ Connection Failed:', error);
    }
};

// Logic to decide WHO gets WHAT notification
const handleEvent = (key, data) => {
    // Assumption: The Event contains user contact info (Rich Event)
    // In a real app, we might fetch this from a User Service if missing.
    
    const { userId, email, phone, deviceId, message } = data;

    // Strategy: Send to ALL available channels (as per case study "Best Effort")
    
    if (email) {
        enqueueNotification(userId, 'EMAIL', email, `[${key}] ${message}`);
    }
    
    if (phone) {
        enqueueNotification(userId, 'SMS', phone, `[${key}] ${message}`);
    }

    if (deviceId) {
        enqueueNotification(userId, 'PUSH', deviceId, `[${key}] ${message}`);
    }
};

module.exports = connectRabbitMQ;