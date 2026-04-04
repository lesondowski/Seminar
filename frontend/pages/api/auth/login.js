export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, language } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let role = 'visitor';

    if (normalizedEmail === 'admin@gmail.com') {
      role = 'admin';
    } else if (normalizedEmail === 'moderator@gmail.com') {
      role = 'moderator';
    }

    // Simulate successful login
    return res.status(200).json({
      success: true,
      email,
      language: language || 'vi',
      role,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
