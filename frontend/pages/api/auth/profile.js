export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get user profile from localStorage (client-side) or session
    return res.status(200).json({
      email: 'user@example.com',
      language: 'vi',
      role: 'visitor',
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
