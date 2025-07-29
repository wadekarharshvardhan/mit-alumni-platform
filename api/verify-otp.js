// /api/verify-otp.js
// Vercel serverless function to verify OTPs (demo: in-memory)

// Use the same in-memory store as send-otp.js (for demo only)
const otpStore = require('./send-otp.js').otpStore || {};

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' });
    return;
  }

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email]; // OTP used, remove it
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
};
