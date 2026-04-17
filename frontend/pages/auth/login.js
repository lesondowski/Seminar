import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { validateEmail } from '../../utils/validation';
import { useLanguage } from '../../utils/i18n/LanguageContext';
import { NoodleBowlIcon, CheckIcon } from '../../components/common/Icons';
import { loginUser } from '../../utils/auth/authService';
import { sendOTP, verifyOTP } from '../../utils/otp';

const LANG_OPTIONS = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' },
  { label: '中文', value: 'zh' },
];

export default function LoginPage() {
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  // OTP States
  const [step, setStep] = useState('email'); // 'email' -> 'otp' -> 'language' -> 'complete'
  const [otp, setOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpTimeout, setOtpTimeout] = useState(0);

  const [modal, setModal] = useState({ isOpen: false, type: 'info', message: '', title: '' });

  // OTP Timer
  useEffect(() => {
    if (otpTimeout > 0) {
      const timer = setTimeout(() => setOtpTimeout(otpTimeout - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimeout]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) { setEmailError(t('login_email_empty')); return; }
    if (!validateEmail(email)) {
      setEmailError(t('login_email_invalid'));
      setModal({ isOpen: true, type: 'error', title: t('login_email_invalid'), message: t('login_email_invalid') });
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      setOtpAttempts(0);
      setOtpTimeout(300);
      setOtp('');
      setOtpError('');

      await sendOTP(email);

      setModal({
        isOpen: true, type: 'success',
        title: t('login_otp_modal_title'),
        message: t('login_otp_modal_msg', { email }),
      });
      setTimeout(() => { setStep('otp'); setModal(m => ({ ...m, isOpen: false })); }, 2000);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: t('login_error_title'), message: t('login_send_otp_error') });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) { setOtpError(t('login_otp_empty')); return; }
    if (otp.length !== 6) { setOtpError(t('login_otp_length')); return; }
    if (otpTimeout <= 0) { setOtpError(t('login_otp_expired')); return; }

    setLoading(true);
    setOtpError('');

    try {
      await verifyOTP(email, otp);

      setModal({ isOpen: true, type: 'success', title: t('login_otp_success_title'), message: t('login_otp_success_msg') });
      setTimeout(() => { setStep('language'); setModal(m => ({ ...m, isOpen: false })); }, 2000);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: t('login_error_title'), message: t('login_verify_error') });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Login
  const handleCompleteLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(email, language, true);

      // Persist session – language already saved via changeLanguage()
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', data.role || 'visitor');
      changeLanguage(language); // ensure context + localStorage in sync

      const queryReturnTo = typeof router.query.returnTo === 'string' ? router.query.returnTo : '';
      const storedRedirect =
        typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') || '' : '';
      const redirectTarget = queryReturnTo || storedRedirect || '/';

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('redirectAfterLogin');
      }

      setModal({ isOpen: true, type: 'success', title: t('login_success_title'), message: t('login_success_msg', { email }) });
      setTimeout(() => {
        router.push(redirectTarget);
      }, 2000);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: t('login_error_title'), message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') { setStep('email'); setOtp(''); setOtpError(''); setOtpAttempts(0); setOtpTimeout(0); }
    else if (step === 'language') { setStep('otp'); setOtp(''); setOtpError(''); }
  };

  const currentLangObj = LANG_OPTIONS.find(l => l.value === language) || LANG_OPTIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">

        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <NoodleBowlIcon className="w-8 h-8" />
            <span>Vĩnh Khánh Food Tour</span>
          </div>

          {/* Language Switcher – visible before login */}
          <div className="flex gap-2">
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => changeLanguage(opt.value)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-200 shadow-sm text-sm font-medium
                  ${language === opt.value
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                aria-label={opt.label}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl shadow-lg mb-4">
              <NoodleBowlIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{t('login_welcome')}</h1>
            <p className="text-gray-600 mt-2">{t('login_subtitle')}</p>
          </div>

          {/* STEP 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                label={t('login_email_label')}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder={t('login_email_placeholder')}
                error={emailError}
                required
              />
              <Button type="submit" variant="primary" disabled={loading || !email} className="w-full">
                {loading ? t('login_btn_sending') : t('login_btn_continue')}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="mb-4">
                <p className="text-sm text-gray-500 text-center">{t('login_step2_title')}</p>
                <div className="mt-2 flex justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm"><CheckIcon className="w-4 h-4" /></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">2</div>
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">3</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 text-center">
                {t('login_otp_sent')} <strong>{email}</strong>
              </div>
              <Input
                label={t('login_otp_label')}
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.slice(0, 6)); setOtpError(''); }}
                placeholder={t('login_otp_placeholder')}
                error={otpError}
                maxLength="6"
                required
              />
              <div className="text-center">
                {otpTimeout > 0 ? (
                  <p className="text-sm text-gray-600">
                    {t('login_otp_expires_in')} <strong>{Math.floor(otpTimeout / 60)}:{(otpTimeout % 60).toString().padStart(2, '0')}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">{t('login_otp_expired')}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">{t('login_btn_back')}</Button>
                <Button type="submit" variant="primary" disabled={loading || !otp || otp.length !== 6 || otpTimeout <= 0} className="flex-1">
                  {loading ? t('login_btn_verifying') : t('login_btn_verify')}
                </Button>
              </div>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setOtpError(''); setOtpAttempts(0); }} className="w-full text-blue-600 hover:text-blue-700 text-sm mt-2">
                {t('login_btn_resend_otp')}
              </button>
            </form>
          )}

          {/* STEP 3: Language */}
          {step === 'language' && (
            <form onSubmit={handleCompleteLogin} className="space-y-5">
              <div className="mb-4">
                <p className="text-sm text-gray-500 text-center">{t('login_step3_title')}</p>
                <div className="mt-2 flex justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm"><CheckIcon className="w-4 h-4" /></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm"><CheckIcon className="w-4 h-4" /></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">3</div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded text-sm text-green-800 text-center">
                Email <strong>{email}</strong> {t('login_email_verified')}
              </div>

              {/* Language cards – instant preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('login_language_label')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => changeLanguage(opt.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                        ${language === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                          : 'border-gray-200 hover:border-gray-400 text-gray-600'}`}
                    >
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">{t('login_btn_back')}</Button>
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? t('login_btn_finishing') : t('login_btn_finish')}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-gray-600 text-sm mt-6">
            {step === 'email' && t('login_footer_email')}
            {step === 'otp' && t('login_footer_otp')}
            {step === 'language' && t('login_footer_lang')}
          </p>
          <div className="mt-3 text-center text-gray-500 text-sm">
            {t('login_demo')} <span className="font-semibold text-gray-700">user@demo.com</span> | <span className="font-semibold text-gray-700">admin@demo.com</span>
          </div>
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => setModal(m => ({ ...m, isOpen: false }))} title={modal.title} message={modal.message} type={modal.type} />
      {loading && <Loading fullScreen text={t('loading')} />}
    </div>
  );
}
