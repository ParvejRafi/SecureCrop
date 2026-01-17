# Forgot Password Feature - Quick Reference

## ✅ What Was Implemented

### Backend (Django)
1. **New Model**: `PasswordResetToken`
   - Stores secure tokens for password reset
   - Auto-expires after 1 hour
   - Single-use tokens

2. **New API Endpoints**:
   - `POST /api/auth/password-reset/` - Request reset
   - `POST /api/auth/password-reset/confirm/` - Reset password
   - `GET /api/auth/password-reset/verify/` - Verify token

3. **Email Integration**: Sends reset links via email

4. **Admin Panel**: View/manage reset tokens

### Frontend (React + TypeScript)
1. **New Pages**:
   - `/forgot-password` - Request password reset
   - `/reset-password` - Set new password

2. **Updated Login Page**: Added "Forgot password?" link

3. **Routes**: Added to App.tsx

## 🔄 User Flow

```
1. User clicks "Forgot password?" on login page
   ↓
2. User enters email address
   ↓
3. System sends reset email with token link
   ↓
4. User clicks link in email
   ↓
5. User enters new password (twice)
   ↓
6. Password is reset → Redirected to login
   ↓
7. User logs in with new password
```

## 🧪 How to Test

### Step 1: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Test the Flow

1. **Navigate to Login**:
   - Go to: http://localhost:5173/login
   - You should see "Forgot password?" link below the password field

2. **Request Password Reset**:
   - Click "Forgot password?"
   - Enter a registered email (e.g., test@example.com)
   - Click "Send Reset Link"

3. **Check Console for Reset Link**:
   - In your backend terminal, look for:
     ```
     Password reset link: http://localhost:5173/reset-password?token=...
     ```
   - Copy the entire URL

4. **Reset Password**:
   - Paste the URL in your browser
   - Enter new password (minimum 8 characters)
   - Confirm password
   - Click "Reset Password"

5. **Login with New Password**:
   - You'll be redirected to login page
   - Login with the new password

## 📧 Email Configuration (Production)

Add to `.env.production`:

```env
# Email Settings (Gmail Example)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@securecrop.com

# Frontend URL
FRONTEND_URL=https://your-production-domain.com
```

## 🔒 Security Features

- ✅ Secure random tokens (32 bytes)
- ✅ Time-limited (1 hour expiry)
- ✅ Single-use tokens
- ✅ Email enumeration prevention
- ✅ Password strength validation
- ✅ HTTPS ready

## 📁 Files Modified/Created

### Backend Files:
- ✅ `backend/accounts/models.py` - Added PasswordResetToken model
- ✅ `backend/accounts/serializers.py` - Added reset serializers
- ✅ `backend/accounts/views.py` - Added reset views
- ✅ `backend/accounts/urls.py` - Added reset endpoints
- ✅ `backend/accounts/admin.py` - Added admin configuration
- ✅ `backend/securecrop/settings.py` - Added FRONTEND_URL
- ✅ `backend/accounts/migrations/0004_passwordresettoken.py` - Database migration

### Frontend Files:
- ✅ `frontend/src/pages/ForgotPassword.tsx` - New page
- ✅ `frontend/src/pages/ResetPassword.tsx` - New page
- ✅ `frontend/src/pages/Login.tsx` - Added forgot password link
- ✅ `frontend/src/App.tsx` - Added routes

### Documentation:
- ✅ `FORGOT_PASSWORD_GUIDE.md` - Comprehensive guide

## 🎨 UI Preview

### Login Page:
- Email field
- Password field
- **"Forgot password?"** link (NEW - in green) ← Users click here
- Sign In button
- "Don't have an account? Register here"

### Forgot Password Page:
- Email input field
- "Send Reset Link" button
- Success message after submission
- "Back to Login" link

### Reset Password Page:
- Token verification spinner (initially)
- New password field
- Confirm password field
- "Reset Password" button
- Success message with auto-redirect

## ⚡ Quick Commands

```bash
# Apply database migrations (already done)
python manage.py migrate

# Create superuser to test admin panel
python manage.py createsuperuser

# Access admin panel
http://localhost:8000/admin

# View reset tokens in admin
Navigate to: Accounts → Password Reset Tokens
```

## 🐛 Troubleshooting

**Problem**: Email not sending
- **Solution**: In development, check backend console for the reset link
- **Production**: Verify email settings in `.env.production`

**Problem**: Token expired
- **Solution**: Request a new reset link (tokens expire in 1 hour)

**Problem**: Token invalid
- **Solution**: Make sure you copied the complete URL from email/console

**Problem**: Password too weak
- **Solution**: Use at least 8 characters with mix of letters, numbers, symbols

## 📞 Support

If you encounter any issues:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify database migration applied: `python manage.py showmigrations accounts`
4. Review `FORGOT_PASSWORD_GUIDE.md` for detailed information

---

**Status**: ✅ Feature fully implemented and tested
**Last Updated**: January 17, 2026
