#!/usr/bin/env python
"""
Test script to verify email configuration
Run this to check if email sending works
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')
django.setup()

from django.core.mail import EmailMessage
from django.conf import settings

print("=" * 60)
print("EMAIL CONFIGURATION TEST")
print("=" * 60)

print(f"\n📧 Email Backend: {settings.EMAIL_BACKEND}")
print(f"📧 Email Host: {settings.EMAIL_HOST}")
print(f"📧 Email Port: {settings.EMAIL_PORT}")
print(f"📧 Email Use TLS: {settings.EMAIL_USE_TLS}")
print(f"📧 Email Host User: {settings.EMAIL_HOST_USER}")
print(f"📧 Email Host Password: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
print(f"📧 Default From Email: {settings.DEFAULT_FROM_EMAIL}")
print(f"📧 Frontend URL: {settings.FRONTEND_URL}")

print("\n" + "=" * 60)
print("TESTING EMAIL SEND")
print("=" * 60)

if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
    print("\n❌ ERROR: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set!")
    print("\nYou need to add these to Render environment variables:")
    print("  EMAIL_HOST_USER=mdparvej.ahmedrafi@student.aiu.edu.my")
    print("  EMAIL_HOST_PASSWORD=iztiblbwiavsurnc")
    exit(1)

try:
    print(f"\n📤 Attempting to send test email to {settings.EMAIL_HOST_USER}...")
    
    email = EmailMessage(
        subject='SecureCrop - Email Configuration Test',
        body='This is a test email to verify your email configuration is working correctly.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.EMAIL_HOST_USER],
    )
    email.send(fail_silently=False)
    
    print("✅ SUCCESS! Email sent successfully!")
    print(f"✅ Check inbox: {settings.EMAIL_HOST_USER}")
    
except Exception as e:
    print(f"\n❌ FAILED to send email!")
    print(f"❌ Error: {str(e)}")
    print("\nPossible issues:")
    print("  1. Email credentials are incorrect")
    print("  2. Gmail app password is not set correctly")
    print("  3. Network/firewall blocking SMTP")
    print("  4. Environment variables not set on Render")

print("\n" + "=" * 60)
