const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
      port: process.env.EMAIL_PORT, // e.g., 587
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password / app password
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Sri-Care" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
