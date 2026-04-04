// API route to send OTP to user email
// POST /api/auth/send-otp

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email không hợp lệ' 
    });
  }

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send OTP via email service (SendGrid, Mailgun, etc.)
    // For now, just log it
    console.log(`OTP for ${email}: ${otp}`);

    // You can also store OTP in a cache (Redis) or temporary storage
    // with expiration time of 5 minutes

    // Return success response
    res.status(200).json({
      success: true,
      message: 'OTP đã được gửi',
      email,
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi OTP',
      error: error.message,
    });
  }
}
