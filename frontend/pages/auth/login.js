import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { validateEmail } from '../../utils/validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('vi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // OTP States
  const [step, setStep] = useState('email'); // 'email' -> 'otp' -> 'language' -> 'complete'
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpTimeout, setOtpTimeout] = useState(0);
  
  const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '' });

  const languages = [
    { label: 'Tiếng Việt', value: 'vi' },
    { label: 'English', value: 'en' },
    { label: '中文', value: 'zh' },
  ];

  // Generate random 6-digit OTP
  const generateOtp = () => {
    return "123456";
  };

  // OTP Timer
  useEffect(() => {
    if (otpTimeout > 0) {
      const timer = setTimeout(() => setOtpTimeout(otpTimeout - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimeout]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Validate email (BR-001)
    if (!email) {
      setEmailError('Email không được để trống');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ. Vui lòng kiểm tra lại.');
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Email không hợp lệ',
        message: 'Email bạn nhập không đúng định dạng. Vui lòng kiểm tra lại.',
      });
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      // Generate OTP (6 digits)
      const otp = generateOtp();
      setGeneratedOtp(otp);
      setOtpAttempts(0);
      setOtpTimeout(300); // 5 minutes timeout
      setOtp('');
      setOtpError('');

      // Simulate API call to send OTP
      // In real app: POST to /api/auth/send-otp
      await new Promise(resolve => setTimeout(resolve, 500));

      // Show OTP in console (for development)
      console.log(`OTP for ${email}: ${otp}`);

      setModal({
        isOpen: true,
        type: 'success',
        title: 'OTP đã được gửi',
        message: `OTP đã được gửi đến ${email}. Kiểm tra email của bạn!`,
      });

      // Move to OTP verification step
      setTimeout(() => {
        setStep('otp');
        setModal({ isOpen: false });
      }, 2000);
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi gửi OTP',
        message: err.message || 'Không thể gửi OTP. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      setOtpError('Vui lòng nhập mã OTP');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP phải có 6 chữ số');
      return;
    }

    if (otpTimeout <= 0) {
      setOtpError('OTP đã hết hạn. Vui lòng gửi OTP mới.');
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      // Simulate OTP verification
      // In real app: POST to /api/auth/verify-otp
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check OTP (simulated)
      if (otp !== generatedOtp) {
        setOtpAttempts(otpAttempts + 1);
        
        if (otpAttempts >= 2) {
          setOtpError('Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi OTP mới.');
          setTimeout(() => {
            setStep('email');
            setOtp('');
            setOtpAttempts(0);
          }, 2000);
        } else {
          setOtpError(`OTP không chính xác. Bạn còn ${2 - otpAttempts} lần thử.`);
        }
        return;
      }

      // OTP verified successfully
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Xác thực thành công!',
        message: 'OTP của bạn đã được xác thực. Tiếp tục với lựa chọn ngôn ngữ...',
      });

      // Move to language selection step
      setTimeout(() => {
        setStep('language');
        setModal({ isOpen: false });
      }, 2000);
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xác thực',
        message: err.message || 'Không thể xác thực OTP. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Login after language selection
  const handleCompleteLogin = async (e) => {
    e.preventDefault();

    if (!language) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Chọn ngôn ngữ',
        message: 'Bạn chưa chọn ngôn ngữ. Ngôn ngữ mặc định sẽ là Tiếng Việt.',
      });
    }

    setLoading(true);
    setError('');

    try {
      // Simulate final login API call
      // In real app: POST to /api/auth/login with email and verified token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          language: language || 'vi',
          otpVerified: true,
        }),
      }).catch(() => ({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          email,
          language: language || 'vi',
          role: 'visitor',
        }),
      }));

      if (!response.ok) {
        throw new Error('Đăng nhập thất bại');
      }

      const data = await response.json();

      // Save user info
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userLanguage', language || 'vi');
      localStorage.setItem('userRole', data.role || 'visitor');

      // Show success modal
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Đăng nhập thành công!',
        message: `Xin chào ${email}! Chúng tôi sẽ chuyển bạn đến bản đồ sau 2 giây...`,
      });

      // Redirect after delay
      setTimeout(() => {
        router.push('/explorer/map');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi đăng nhập',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value || 'vi');
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      setOtpError('');
      setOtpAttempts(0);
      setOtpTimeout(0);
    } else if (step === 'language') {
      setStep('otp');
      setOtp('');
      setOtpError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <span className="text-3xl"></span>
            <span>Vĩnh Khánh Food Tour</span>
          </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl 
              border border-gray-300 bg-white 
              hover:bg-gray-100 active:scale-95 
              transition-all duration-200 
              shadow-sm hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Change language"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a15 15 0 0 1 0 18" />
                <path d="M12 3a15 15 0 0 0 0 18" />
              </svg>

              <span className="font-medium text-gray-700">VI</span>
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl shadow-lg mb-4">
              🍲
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Chào mừng đến Vĩnh Khánh</h1>
            <p className="text-gray-600 mt-2">Khám phá khu phố ẩm thực</p>
          </div>

        {/* STEP 1: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-5">

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="example@email.com"
              error={emailError}
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? 'Đang gửi OTP...' : 'Tiếp tục'}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="mb-4">
              <p className="text-sm text-gray-500 text-center">Bước 2/3: Xác thực OTP</p>
              <div className="mt-2 flex justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">✓</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">2</div>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">3</div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 text-center">
              OTP đã được gửi tới <strong>{email}</strong>
            </div>

            <Input
              label="Mã OTP"
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.slice(0, 6));
                setOtpError('');
              }}
              placeholder="Nhập 6 chữ số"
              error={otpError}
              maxLength="6"
              required
            />

            {/* OTP Timeout */}
            <div className="text-center">
              {otpTimeout > 0 ? (
                <p className="text-sm text-gray-600">
                  OTP hết hạn trong: <strong>{Math.floor(otpTimeout / 60)}:{(otpTimeout % 60).toString().padStart(2, '0')}</strong>
                </p>
              ) : (
                <p className="text-sm text-red-600"> OTP đã hết hạn. Vui lòng gửi OTP mới.</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !otp || otp.length !== 6 || otpTimeout <= 0}
                className="flex-1"
              >
                {loading ? 'Xác thực...' : 'Xác thực'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setOtpError('');
                setOtpAttempts(0);
              }}
              className="w-full text-blue-600 hover:text-blue-700 text-sm mt-2"
            >
              Gửi OTP mới
            </button>
          </form>
        )}

        {/* STEP 3: Language Selection */}
        {step === 'language' && (
          <form onSubmit={handleCompleteLogin} className="space-y-5">
            <div className="mb-4">
              <p className="text-sm text-gray-500 text-center">Bước 3/3: Chọn Ngôn ngữ</p>
              <div className="mt-2 flex justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">✓</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">✓</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">3</div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded text-sm text-green-800 text-center">
              Email <strong>{email}</strong> đã được xác thực
            </div>

            <Select
              label="Chọn ngôn ngữ"
              value={language}
              onChange={handleLanguageChange}
              options={languages}
              required
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Đang đăng nhập...' : 'Hoàn thành'}
              </Button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          {step === 'email' && 'Bất kỳ email nào để bắt đầu'}
          {step === 'otp' && 'Kiểm tra email để nhận OTP'}
          {step === 'language' && 'Chọn ngôn ngữ ưa thích của bạn'}
        </p>

        <div className="mt-3 text-center text-gray-500 text-sm">
          Demo accounts: <span className="font-semibold text-gray-700">user@demo.com</span> | <span className="font-semibold text-gray-700">admin@demo.com</span>
        </div>
      </div>
    </div>

      {/* Error Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Loading Overlay */}
      {loading && <Loading fullScreen text="Đang xử lý..." />}
    </div>
  );
}
