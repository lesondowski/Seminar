// API route to verify OTP
// POST /api/auth/verify-otp

// Temporary in-memory storage for OTPs (replace with Redis in production)
const otpStore = new Map();

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email và OTP không được để trống' 
    });
  }

  if (otp.length !== 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'OTP phải có 6 chữ số' 
    });
  }

  try {
    // Get stored OTP for this email
    const storedOTPData = otpStore.get(email);

    // Check if OTP exists and not expired
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: 'OTP không tồn tại hoặc đã hết hạn',
      });
    }

    const { otp: storedOtp, expiresAt, attempts } = storedOTPData;

    // Check if OTP expired (5 minutes)
    if (Date.now() > expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP đã hết hạn',
      });
    }

    // Check attempts (max 3)
    if (attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Bạn đã thử quá nhiều lần. Vui lòng yêu cầu OTP mới.',
      });
    }

    // Verify OTP
    if (otp !== storedOtp) {
      // Increment attempts
      otpStore.set(email, {
        ...storedOTPData,
        attempts: attempts + 1,
      });

      return res.status(400).json({
        success: false,
        message: `OTP không chính xác. Bạn còn ${3 - attempts - 1} lần thử.`,
      });
    }

    // OTP verified successfully
    // Remove OTP from store
    otpStore.delete(email);

    // Generate verification token (JWT or simple token)
    const verificationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'OTP xác thực thành công',
      email,
      verificationToken,
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xác thực OTP',
      error: error.message,
    });
  }
}

// Helper function to store OTP (call this from send-otp endpoint)
export function storeOTP(email, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, {
    otp,
    expiresAt,
    attempts: 0,
  });
}

// Helper function to get stored OTP (for testing)
export function getStoredOTP(email) {
  return otpStore.get(email);
}
