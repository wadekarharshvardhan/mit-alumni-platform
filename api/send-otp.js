// /api/send-otp.js
// Vercel serverless function for sending OTP emails using nodemailer

const nodemailer = require('nodemailer');

const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
  // Store OTP in Redis for 5 minutes
  await redis.set(email, otp, { ex: 300 });

  // Log environment variables for debugging (do not log secrets in production)
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);

  // Use SMTP transport with host/port for flexibility
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
    secure: !process.env.SMTP_PORT || process.env.SMTP_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
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
    console.error('Failed to send email:', err);
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
};
