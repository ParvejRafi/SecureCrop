"""
Check the exact error message in email logs - write to file
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')

import django
django.setup()

from notifications.models import EmailLog

with open('error_log.txt', 'w') as f:
    f.write("=== Recent Email Logs with ERRORS ===\n\n")
    logs = EmailLog.objects.filter(status='failed').order_by('-created_at')[:5]

    for log in logs:
        f.write(f"ID: {log.id}\n")
        f.write(f"Email: {log.recipient_email}\n")
        f.write(f"Created: {log.created_at}\n")
        f.write(f"Status: {log.status}\n")
        f.write(f"ERROR: {log.error_message}\n")
        f.write("-" * 50 + "\n")

print("Check error_log.txt")
