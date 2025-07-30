// /api/verify-otp.js
// Vercel serverless function to verify OTPs (demo: in-memory)

const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' });
    return;
  }
  email = email.trim().toLowerCase();

  (async () => {
    try {
      const storedOtp = await redis.get(email);
      console.log('OTP get for', email, ':', storedOtp, 'user entered:', otp);
      // Ensure both are strings for comparison
      if (typeof storedOtp !== 'undefined' && storedOtp !== null && String(storedOtp) === String(otp)) {
        await redis.del(email);
        console.log('OTP verified successfully for', email);
        res.status(200).json({ success: true });
      } else {
        console.log('OTP verification failed for', email, 'stored:', storedOtp, 'entered:', otp);
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  })();
};
