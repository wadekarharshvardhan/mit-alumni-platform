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

  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' });
    return;
  }

  (async () => {
    try {
      const storedOtp = await redis.get(email);
      if (storedOtp && storedOtp === otp) {
        await redis.del(email);
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  })();
};
