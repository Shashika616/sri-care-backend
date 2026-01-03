const EventEmitter = require('events');
class BillingEventEmitter extends EventEmitter {}
const billingEmitter = new BillingEventEmitter();

module.exports = billingEmitter;
