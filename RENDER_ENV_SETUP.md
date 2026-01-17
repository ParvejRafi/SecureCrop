# Render Environment Variables Setup Guide

## 🚨 CRITICAL: Your app is failing because environment variables are missing on Render

The .env files are NOT deployed to Render (they're in .gitignore). You MUST manually add these environment variables in the Render dashboard.

---

## Backend Service Environment Variables

Go to: https://dashboard.render.com → Select "securecrop-backend" → Environment tab

### Required Variables:

```
PYTHON_VERSION=3.11.0
DEBUG=False
SECRET_KEY=2bw$fas!(dv^1%m13*ojinist(hxeeseqt39=1v2)p#3c)*pr3
ALLOWED_HOSTS=securecrop-backend.onrender.com
DATABASE_URL=postgresql://securecrop_db_user:ndV1zikLwfZFYqNvkt8mXkyeC3I0VN77@dpg-d59vv5pr0fns7382n13g-a/securecrop_db

OPENWEATHER_API_KEY=90d15b7fdfc7a271fe97287339babf47

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=mdparvej.ahmedrafi@student.aiu.edu.my
EMAIL_HOST_PASSWORD=iztiblbwiavsurnc
DEFAULT_FROM_EMAIL=mdparvej.ahmedrafi@student.aiu.edu.my

FRONTEND_URL=https://securecrop.onrender.com
CORS_ALLOWED_ORIGINS=https://securecrop.onrender.com

GEMINI_API_KEY=AIzaSyD8odHyGLy9QWmERu8Vz2RoIMiDrsxoykA
```

**⚠️ IMPORTANT:** After adding these, click "Save Changes" and the service will redeploy.

---

## Frontend Service Environment Variables

Go to: https://dashboard.render.com → Select "securecrop" (frontend) → Environment tab

### Required Variable:

```
VITE_API_URL=https://securecrop-backend.onrender.com/api
```

**Note:** If you're using a Static Site on Render, you need to add this as a **Build-time** environment variable, not a runtime variable.

For Static Sites, add it in the "Build Command" section like this:
```bash
VITE_API_URL=https://securecrop-backend.onrender.com/api npm run build
```

Or better yet, in the Environment section add:
```
VITE_API_URL=https://securecrop-backend.onrender.com/api
```

---

## How to Add Environment Variables on Render

1. Go to https://dashboard.render.com
2. Select your service (backend or frontend)
3. Click on "Environment" in the left sidebar
4. Click "Add Environment Variable" button
5. Enter the Key and Value
6. Click "Save Changes"
7. Wait for automatic redeploy (2-3 minutes)

---

## Verification Steps

After adding all environment variables and waiting for redeploy:

### 1. Test Backend Health
Open: https://securecrop-backend.onrender.com/api/
- Should show: API is running message or 404 (normal)

### 2. Test CORS
Open browser console on: https://securecrop.onrender.com
- Try logging in - should NOT see CORS errors

### 3. Test Login
- Email: mdparvej.ahmedrafi@student.aiu.edu.my  
- Should successfully log in without "Network Error"

### 4. Test Password Reset
- Click "Forgot Password"
- Enter your email
- Check inbox for reset link
- Link should point to https://securecrop.onrender.com (NOT localhost)

---

## Common Issues

### Issue: Still seeing CORS errors
**Solution:** Make sure `CORS_ALLOWED_ORIGINS=https://securecrop.onrender.com` is added to backend and you saved changes.

### Issue: Getting 404 on /api/api/ (double api)
**Solution:** Make sure `VITE_API_URL` in frontend includes `/api` at the end: `https://securecrop-backend.onrender.com/api`

### Issue: Password reset email still shows localhost
**Solution:** Make sure `FRONTEND_URL=https://securecrop.onrender.com` is added to backend environment variables.

### Issue: Can't see environment variables working
**Solution:** After adding env vars, you MUST click "Save Changes" and wait for redeploy to complete.

---

## Quick Copy-Paste for Render

### Backend (copy all lines below, add one by one):
```
PYTHON_VERSION → 3.11.0
DEBUG → False
SECRET_KEY → 2bw$fas!(dv^1%m13*ojinist(hxeeseqt39=1v2)p#3c)*pr3
ALLOWED_HOSTS → securecrop-backend.onrender.com
DATABASE_URL → postgresql://securecrop_db_user:ndV1zikLwfZFYqNvkt8mXkyeC3I0VN77@dpg-d59vv5pr0fns7382n13g-a/securecrop_db
OPENWEATHER_API_KEY → 90d15b7fdfc7a271fe97287339babf47
EMAIL_BACKEND → django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST → smtp.gmail.com
EMAIL_PORT → 587
EMAIL_USE_TLS → True
EMAIL_HOST_USER → mdparvej.ahmedrafi@student.aiu.edu.my
EMAIL_HOST_PASSWORD → iztiblbwiavsurnc
DEFAULT_FROM_EMAIL → mdparvej.ahmedrafi@student.aiu.edu.my
FRONTEND_URL → https://securecrop.onrender.com
CORS_ALLOWED_ORIGINS → https://securecrop.onrender.com
GEMINI_API_KEY → AIzaSyD8odHyGLy9QWmERu8Vz2RoIMiDrsxoykA
```

### Frontend:
```
VITE_API_URL → https://securecrop-backend.onrender.com/api
```
