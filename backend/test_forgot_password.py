import os
import sys
import django

# Add backend to path
sys.path.insert(0, r'C:\Users\user\Desktop\SecuredCropSystem\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')
django.setup()

from accounts.models import User, PasswordResetToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets

# Get a test user
user = User.objects.get(email='mdparvej.ahmedrafi@student.aiu.edu.my')
print(f"Testing forgot password for: {user.email}")

# Invalidate old tokens
PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

# Create new reset token
token = secrets.token_urlsafe(32)
expires_at = timezone.now() + timedelta(hours=1)
reset_token = PasswordResetToken.objects.create(
    user=user,
    token=token,
    expires_at=expires_at
)

# Build reset link
frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
reset_link = f"{frontend_url}/reset-password?token={reset_token.token}"

print(f"\nPassword reset token created!")
print(f"Token: {token[:20]}...")
print(f"Expires at: {expires_at}")
print(f"Reset link: {reset_link}\n")

# Send email
try:
    print("Sending password reset email...")
    send_mail(
        subject='Password Reset Request - SecureCrop',
        message=f"""
Hello {user.username},

You have requested to reset your password for your SecureCrop account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
SecureCrop Team
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    print(f"✅ Email sent successfully to {user.email}")
    print("\n🎉 Forgot Password feature is working!")
    print("\nPlease check your email inbox (and spam folder) for the reset link.")
    
except Exception as e:
    print(f"❌ Error sending email: {e}")
    print(f"\nBut the token was created successfully!")
    print(f"You can use this reset link for testing: {reset_link}")
