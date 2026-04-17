import { apiRequest } from './api/client';

// OTP Utilities

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate OTP format (must be 6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean}
 */
export const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};

/**
 * Send OTP to user email
 * @param {string} email - User email
 * @returns {Promise<object>}
 */
export const sendOTP = async (email) => {
  return apiRequest('/auth/send-otp', {
    method: 'POST',
    body: { email },
  });
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {Promise<object>}
 */
export const verifyOTP = async (email, otp) => {
  if (!validateOTP(otp)) {
    throw new Error('OTP phải có 6 chữ số');
  }

  return apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: { email, otp },
  });
};

/**
 * Store OTP verification token in localStorage
 * @param {string} token - Verification token
 */
export const storeOTPToken = (token) => {
  localStorage.setItem('otpVerificationToken', token);
};

/**
 * Get OTP verification token from localStorage
 * @returns {string|null}
 */
export const getOTPToken = () => {
  return localStorage.getItem('otpVerificationToken');
};

/**
 * Clear OTP verification token
 */
export const clearOTPToken = () => {
  localStorage.removeItem('otpVerificationToken');
};

/**
 * Format remaining time for OTP timeout
 * @param {number} seconds - Remaining seconds
 * @returns {string} Formatted time (mm:ss)
 */
export const formatOTPTimeout = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Example usage:
// 1. Generate OTP: const otp = generateOTP();
// 2. Send OTP: await sendOTP(email);
// 3. Verify OTP: const result = await verifyOTP(email, userEnteredOTP);
// 4. Store token: storeOTPToken(result.verificationToken);
