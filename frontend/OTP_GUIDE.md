# OTP Authentication Guide - Smart Food Tour App

## 📋 Overview

Hệ thống OTP (One-Time Password) đã được triển khai để tăng bảo mật cho quá trình đăng nhập. Người dùng sẽ phải:

1. ✉️ Nhập email
2. 🔐 Xác thực OTP gửi đến email
3. 🌐 Chọn ngôn ngữ
4. ✅ Hoàn thành đăng nhập

---

## 🔄 OTP Flow

```
User           Browser        Backend
  │                │              │
  ├─ Enter Email → │ ──────────→ │
  │                │              │
  │                │ ← Generate & Send OTP
  │                │              │
  ├─ Check Email ← │ (OTP shown in console & email)
  │                │              │
  ├─ Enter OTP ──→ │ ──────────→ │
  │                │              │
  │                │ ← Verify & Return Token
  │                │              │
  ├─ Select Lang → │ ──────────→ │
  │                │              │
  │                │ ← Login Success
  │                │              │
  └─ Redirect ────→│ (to /explorer/map)
```

---

## 🚀 Quick Test

### Step 1: Start Dev Server (if not running)
```bash
cd frontend
npm run dev
```
Access: http://localhost:3001/auth/login

### Step 2: Login with OTP
1. **Email Screen**:
   - Enter any email (e.g., `test@example.com`)
   - Click "📤 Tiếp tục"

2. **OTP Screen**:
   - Check browser console (F12) - OTP will be printed there
   - Example output: `🔐 OTP for test@example.com: 123456`
   - Enter the 6-digit OTP
   - Click "✓ Xác thực"

3. **Language Screen**:
   - Select your preferred language
   - Click "✓ Hoàn thành"

4. **Success**:
   - You'll be redirected to `/explorer/map`

---

## 📝 Test Cases

### Valid OTP Flow
```
Input:
- Email: user@example.com
- OTP: [6-digit code from console]
- Language: Tiếng Việt

Expected Result: Login successful → Redirect to map
```

### Invalid OTP
```
Input:
- Email: user@example.com
- OTP: 000000 (wrong)

Expected Result: Error message with remaining attempts (2 left)
```

### Max Attempts Exceeded
```
Input:
- Email: user@example.com
- Wrong OTP 3 times

Expected Result: Error message, redirect back to email screen
```

### OTP Timeout
```
Condition: Wait more than 5 minutes

Expected Result: Error message "OTP đã hết hạn"
```

### Empty OTP
```
Input:
- OTP field left empty

Expected Result: Error message "Vui lòng nhập mã OTP"
```

---

## 💾 Files Modified/Created

### Files Modified
- `pages/auth/login.js` - Added 3-step OTP flow
  - Step 1: Email input with send OTP button
  - Step 2: OTP verification with timeout counter
  - Step 3: Language selection after OTP verified

### Files Created
- `pages/api/auth/send-otp.js` - API to send OTP
- `pages/api/auth/verify-otp.js` - API to verify OTP
- `utils/otp.js` - OTP utility functions

---

## 🔐 Security Considerations

### Current Implementation (Development)
- ✅ OTP generated client-side (6 random digits)
- ✅ OTP validation on client
- ✅ 5-minute expiration timer
- ✅ Max 3 attempts per OTP
- ✅ Local storage for verification state

### Production Recommendations
- [ ] Generate OTP on backend
- [ ] Send OTP via email service (SendGrid, Mailgun, etc.)
- [ ] Store OTP in Redis with expiration
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting (max OTP requests per email)
- [ ] Add CAPTCHA after failed attempts
- [ ] Log all OTP attempts for security audit
- [ ] Use JWT tokens for OTP verification
- [ ] Implement 2FA with backup codes
- [ ] Add email verification check before login

---

## 🛠️ Configuration

### OTP Settings (in login.js)
```javascript
// OTP expires after 5 minutes
setOtpTimeout(300); // seconds

// Max 3 OTP attempts
if (otpAttempts >= 3) { ... }

// OTP format: 6 digits
otp.length !== 6 // validation
```

### To Change Timeout
Edit `pages/auth/login.js`:
```javascript
// Change from 300 to your preferred seconds
setOtpTimeout(600); // 10 minutes
```

### To Change Max Attempts
Edit `pages/auth/login.js`:
```javascript
// Change from 2 to your preferred number
if (otpAttempts >= 3) { // max 3 attempts (0, 1, 2)
```

---

## 🧪 Testing with API Calls

### Send OTP
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Response:
```json
{
  "success": true,
  "message": "OTP đã được gửi",
  "email": "test@example.com",
  "otp": "123456" (only in development)
}
```

### Verify OTP
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

Response:
```json
{
  "success": true,
  "message": "OTP xác thực thành công",
  "email": "test@example.com",
  "verificationToken": "dGVzdEBleGFtcGxlLmNvbToxNzI0MDAwMDAw"
}
```

---

## 📊 Business Rules Implemented

| Rule | Implementation |
|------|-----------------|
| BR-001 (Email Validation) | ✅ Regex validation on email field |
| BR-OTP-001 | ✅ Generate random 6-digit OTP |
| BR-OTP-002 | ✅ OTP expires after 5 minutes |
| BR-OTP-003 | ✅ Max 3 attempts to enter OTP |
| BR-OTP-004 | ✅ Clear error messages on wrong OTP |
| BR-OTP-005 | ✅ Language selection after OTP verified |

---

## 🔗 Integration with Backend

### Current Flow (Frontend)
- OTP generation: Client-side (random 6 digits)
- OTP display: Browser console (for testing)
- OTP verification: Client-side comparison

### Future Integration (Backend)
1. **Send OTP Endpoint** (`/api/auth/send-otp`)
   ```
   POST /api/auth/send-otp
   Body: { email, language }
   
   Backend:
   - Generate OTP on server
   - Send via email service
   - Store in Redis with 5min expiry
   - Return success message
   ```

2. **Verify OTP Endpoint** (`/api/auth/verify-otp`)
   ```
   POST /api/auth/verify-otp
   Body: { email, otp }
   
   Backend:
   - Retrieve OTP from Redis
   - Check expiration
   - Verify against stored OTP
   - Generate JWT token
   - Delete OTP from Redis
   - Return JWT token
   ```

3. **Login Endpoint** (use existing `/api/auth/login`)
   ```
   POST /api/auth/login
   Body: { email, language, otpVerified=true, verificationToken }
   
   Backend:
   - Verify JWT token
   - Create user session
   - Return user data
   ```

---

## 📱 UI/UX Features

### Visual Feedback
- ✅ Step progress indicator (1, 2, 3)
- ✅ Step status (current step highlighted in blue)
- ✅ OTP timer countdown (mm:ss format)
- ✅ Attempt counter (remaining attempts shown)
- ✅ Clear error messages
- ✅ Success/warning modals

### User-Friendly Features
- 🔄 "Gửi OTP mới" button to resend OTP
- ← Quay lại button to go back to previous step
- ⏱️ Visual timer for OTP expiration
- 📧 Email confirmation display
- ✅ Email verification checkmark

---

## ❌ Error Handling

### Possible Errors
1. **Email không hợp lệ** → Validate email format
2. **OTP không chính xác** → Show remaining attempts
3. **OTP đã hết hạn** → Allow sending new OTP
4. **Bạn đã thử quá nhiều lần** → Redirect to email screen

### User Messages (Vietnamese)
- ✅ "OTP đã được gửi"
- ✅ "Xác thực thành công!"
- ❌ "OTP không chính xác"
- ❌ "OTP đã hết hạn"
- ⚠️ "Email không hợp lệ"

---

## 🎯 Next Steps (Future Enhancements)

1. **Email Service Integration**
   - SendGrid, Mailgun, or similar
   - Beautiful email templates
   - Email tracking

2. **Enhanced Security**
   - Backend OTP generation
   - Rate limiting
   - CAPTCHA after failed attempts

3. **Alternative Auth Methods**
   - SMS OTP
   - Google/Facebook login
   - Biometric authentication

4. **Analytics**
   - Track OTP success rate
   - Monitor failed attempts
   - Detect suspicious patterns

5. **User Experience**
   - Resend OTP with countdown
   - Remember email for next login
   - Autofill OTP from clipboard

---

## 📞 Support

For issues or questions:
- Check browser console (F12) for OTP value
- Review API response in Network tab
- Check DEVELOPMENT_GUIDE.md for more examples
- Review code comments in `pages/auth/login.js`

---

**Created**: April 1, 2026  
**Version**: 1.0.0 (MVP with OTP)  
**Status**: ✅ Ready for Testing
