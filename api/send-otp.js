// /api/send-otp.js
// Vercel serverless function for sending OTP emails using nodemailer

const nodemailer = require('nodemailer');

// In-memory store for OTPs (for demo; use a DB in production)
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const otp = generateOTP();
  otpStore[email] = otp;

  // Configure your SMTP transport (use environment variables in production)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER, // your Gmail address
      pass: process.env.SMTP_PASS  // your Gmail app password
    }
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your MIT School Alumni OTP',
    text: `Your OTP for MIT School Alumni registration is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
};
