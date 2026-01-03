const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { getBillTemplate } = require('../template/billNotification');

// 1. Setup Email Transporter (Nodemailer)
const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Setup SMS Client (Twilio)
// Only initialize if credentials exist to avoid crashes
const twilioClient = process.env.TWILIO_SID 
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) 
    : null;

// THE ADAPTER FUNCTION
// This matches the exact signature of your previous Mock function
const sendToExternalProvider = async (channel, recipient, message) => {
    
// --- EMAIL HANDLER ---
    if (channel === 'EMAIL') {
        try {
            // 1. Generate the HTML Content
            // We assume 'message' contains JSON string or we parse meaningful data.
            // For now, let's extract data if the input allows, or use defaults.
            const htmlContent = getBillTemplate('Valued Customer', '1,500.00', 'Jan 25, 2026', 'January');

            const info = await emailTransporter.sendMail({
                from: `"Sri Care Support" <${process.env.EMAIL_USER}>`, // Professional Name
                to: recipient,
                subject: "Your Sri-Care Monthly Bill is Ready", // Professional Subject
                text: message, // Fallback for old devices
                html: htmlContent // <--- THE PROFESSIONAL TEMPLATE
            });
            console.log(`✅ [Real Email] Sent: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('❌ [Real Email] Error:', error);
            throw new Error('Email Provider Failed');
        }
    }
    


    // // --- SMS HANDLER (Updated for Messaging Service) ---
    // if (channel === 'SMS') {
    //     if (!twilioClient) throw new Error('Twilio not configured');
        
    //     try {
    //         const result = await twilioClient.messages.create({
    //             body: message,
    //             // INSTEAD OF 'from', USE 'messagingServiceSid':
    //             messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, 
    //             to: recipient
    //         });
    //         console.log(`✅ [Real SMS] Sent via Service ${process.env.TWILIO_MESSAGING_SERVICE_SID}: ${result.sid}`);
    //         return true;
    //     } catch (error) {
    //         console.error('❌ [Real SMS] Error:', error);
    //         throw new Error('SMS Provider Failed');
    //     }
    // }


    // --- PUSH HANDLER (Example placeholder) ---
    if (channel === 'PUSH') {
        // You would use firebase-admin here for real Push Notifications
        console.log(`⚠️ Push not implemented in this demo, using Mock.`);
        return true; 
    }
};

module.exports = { sendToExternalProvider };