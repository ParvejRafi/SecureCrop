# Forgot Password Feature - Implementation Guide

## Overview
The "Forgot Password" feature has been successfully implemented in SecureCrop. This allows users to securely reset their password via email if they forget it.

## How It Works

### 1. **User Flow**

#### Step 1: Request Password Reset
- User clicks "Forgot password?" link on the login page
- User is redirected to `/forgot-password` page
- User enters their registered email address
- System sends a password reset email with a unique token link

#### Step 2: Receive Reset Email
- User receives an email with a password reset link
- Link format: `http://localhost:5173/reset-password?token=SECURE_TOKEN`
- Token is valid for **1 hour** only
- Email includes clear instructions

#### Step 3: Reset Password
- User clicks the link in their email
- System verifies the token is valid and not expired
- User sees the reset password page with the email pre-displayed
- User enters new password (twice for confirmation)
- Password must meet security requirements (minimum 8 characters)

#### Step 4: Confirmation
- Password is updated successfully
- User is redirected to login page with success message
- User can now login with the new password

### 2. **Security Features**

✅ **Token-Based System**
- Each reset request generates a unique, secure random token
- Tokens are stored in database with expiration time

✅ **Time-Limited Tokens**
- Tokens expire after 1 hour
- Expired tokens cannot be used

✅ **Single-Use Tokens**
- Once a token is used to reset password, it's marked as used
- Used tokens cannot be reused

✅ **Email Enumeration Prevention**
- System returns same message whether email exists or not
- Prevents attackers from discovering registered emails

✅ **Password Validation**
- Minimum 8 characters
- Django's built-in password validators
- Passwords must match in confirmation field

### 3. **Technical Implementation**

#### Backend Components

**Models** (`backend/accounts/models.py`):
- `PasswordResetToken` model:
  - `user` - Foreign key to User
  - `token` - Unique secure token
  - `created_at` - Timestamp
  - `expires_at` - Expiration timestamp (1 hour from creation)
  - `used` - Boolean flag

**API Endpoints** (`backend/accounts/urls.py`):
```
POST   /api/auth/password-reset/          - Request password reset
POST   /api/auth/password-reset/confirm/  - Confirm password reset with token
GET    /api/auth/password-reset/verify/   - Verify token validity
```

**Views** (`backend/accounts/views.py`):
- `PasswordResetRequestView` - Handles reset requests and sends emails
- `PasswordResetConfirmView` - Handles password reset with token
- `PasswordResetVerifyTokenView` - Verifies token validity

**Serializers** (`backend/accounts/serializers.py`):
- `PasswordResetRequestSerializer` - Validates email input
- `PasswordResetConfirmSerializer` - Validates password reset data

#### Frontend Components

**Pages**:
- `/forgot-password` - ForgotPassword.tsx
- `/reset-password` - ResetPassword.tsx

**Routes** (`frontend/src/App.tsx`):
```tsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

**Login Page Update**:
- Added "Forgot password?" link below password field

### 4. **Email Configuration**

#### Development Mode
In development, emails are printed to the console. You can see:
- Email content in terminal/console
- Reset link in console (also returned in API response for testing)

#### Production Mode
Configure these environment variables in `.env.production`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@securecrop.com
FRONTEND_URL=https://your-production-domain.com
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Use the generated app password in `EMAIL_HOST_PASSWORD`

**For Other Email Providers:**
- Update `EMAIL_HOST` and `EMAIL_PORT` accordingly
- Consult your email provider's SMTP documentation

### 5. **Testing the Feature**

#### Testing in Development:

1. **Start Backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow:**
   - Go to http://localhost:5173/login
   - Click "Forgot password?"
   - Enter registered email address
   - Check backend console/terminal for reset link
   - Copy the link and paste in browser
   - Enter new password
   - Login with new password

#### Example Test:

```bash
# 1. Register a test user (or use existing user)
Email: test@example.com

# 2. Request password reset
Navigate to: http://localhost:5173/forgot-password
Enter: test@example.com

# 3. Check backend console for output like:
Password reset link: http://localhost:5173/reset-password?token=AbCdEf123...

# 4. Copy and paste the full link in browser

# 5. Enter new password (e.g., "NewPassword123!")

# 6. Login with new credentials
```

### 6. **Database Migration**

The database migration has been applied. The new table is:
- **Table Name:** `password_reset_tokens`
- **Fields:** id, user_id, token, created_at, expires_at, used

### 7. **User Interface Screenshots**

#### Login Page with Forgot Password Link
- Green "Forgot password?" link below password field
- Clearly visible and accessible

#### Forgot Password Page
- Clean, simple form
- Email input field
- Clear instructions
- Success message after submission
- Link to return to login

#### Reset Password Page
- Token verification on load
- Shows user's email
- Two password fields (new password + confirmation)
- Password requirements displayed
- Auto-redirect to login on success

### 8. **Error Handling**

The system handles these scenarios gracefully:

✅ **Invalid Email**
- Returns generic success message (security best practice)

✅ **Expired Token**
- Shows clear error message
- Provides button to request new reset link

✅ **Invalid Token**
- Shows error message
- Provides button to request new reset link

✅ **Password Mismatch**
- Client and server-side validation
- Clear error message

✅ **Weak Password**
- Django validators enforce strong passwords
- Clear error messages

✅ **Email Sending Failure**
- Logs error on server
- In development, prints link to console as fallback
- Returns success message to user (doesn't reveal email issues)

### 9. **Maintenance & Cleanup**

**Optional Cleanup Task:**

Old expired tokens can accumulate in the database. You can create a periodic task to clean them up:

```python
# In backend/accounts/management/commands/cleanup_reset_tokens.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import PasswordResetToken

class Command(BaseCommand):
    help = 'Delete expired password reset tokens'

    def handle(self, *args, **kwargs):
        expired_tokens = PasswordResetToken.objects.filter(
            expires_at__lt=timezone.now()
        )
        count = expired_tokens.count()
        expired_tokens.delete()
        self.stdout.write(f'Deleted {count} expired tokens')
```

Run with: `python manage.py cleanup_reset_tokens`

### 10. **Security Considerations**

✅ **Token Generation**
- Uses Python's `secrets` module for cryptographically secure random tokens
- 32-byte URL-safe tokens

✅ **Database Queries**
- Indexed on token field for fast lookups
- Foreign key constraints prevent orphaned records

✅ **Rate Limiting** (Recommended for Production)
- Consider adding rate limiting to prevent abuse
- Use Django middleware or tools like django-ratelimit

✅ **HTTPS Required**
- Always use HTTPS in production
- Password reset links contain sensitive tokens

## Summary

The Forgot Password feature is now fully implemented with:
- ✅ Secure token-based password reset
- ✅ Email notifications with reset links
- ✅ Time-limited (1 hour) single-use tokens
- ✅ User-friendly frontend pages
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Development and production ready

Users can now easily reset their passwords if they forget them, making the SecureCrop system more user-friendly while maintaining security standards.
