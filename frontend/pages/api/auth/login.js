export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, language } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    // Simulate successful login
    return res.status(200).json({
      success: true,
      email,
      language: language || 'vi',
      role: 'visitor', // or 'admin', 'restaurant' based on email
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
