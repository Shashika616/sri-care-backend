// This function generates a professional HTML email
const getBillTemplate = (customerName, amount, dueDate, month) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background-color: #004d99; padding: 20px; text-align: center; color: #ffffff; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; text-align: center; color: #333333; }
            .amount-box { background-color: #e6f2ff; padding: 15px; font-size: 24px; font-weight: bold; color: #004d99; border-radius: 5px; margin: 20px 0; }
            .btn { display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Sri-Care</h1>
            </div>
            <div class="content">
                <h2>Hello ${customerName},</h2>
                <p>Your mobile bill for <strong>${month}</strong> is now ready.</p>
                
                <div class="amount-box">
                    Total Due: ${amount} LKR
                </div>
                
                <p>Please pay before <strong>${dueDate}</strong> to avoid service interruption.</p>
                
                <a href="https://sricare.lk/pay" class="btn">Pay Bill Now</a>
            </div>
            <div class="footer">
                <p>&copy; 2026 Sri Tel Ltd. All rights reserved.</p>
                <p>This is an automated message. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getBillTemplate };