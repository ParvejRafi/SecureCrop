"""
Check email logs
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')

import django
django.setup()

from notifications.models import EmailLog, WeatherAlertNotification
from accounts.models import User

print("=== Users with email alerts enabled ===")
users = User.objects.filter(is_active=True, receive_email_alerts=True)
for u in users:
    print(f"  {u.username}: email={u.email}, lat={u.location_lat}, lon={u.location_lon}")
print(f"Total: {users.count()}")

print("\n=== Users eligible for weather alerts (with location) ===")
eligible = User.objects.filter(
    is_active=True,
    receive_email_alerts=True,
    location_lat__isnull=False,
    location_lon__isnull=False
).exclude(email='')
for u in eligible:
    print(f"  {u.username}: email={u.email}, lat={u.location_lat}, lon={u.location_lon}")
print(f"Total eligible: {eligible.count()}")

print("\n=== Recent alerts ===")
alerts = WeatherAlertNotification.objects.all().order_by('-created_at')[:5]
for a in alerts:
    print(f"  {a.id}: {a.title} - emails_sent={a.emails_sent_count}")

print("\n=== Recent email logs ===")
logs = EmailLog.objects.all().order_by('-created_at')[:10]
for l in logs:
    error_msg = l.error_message[:100] if l.error_message else 'None'
    print(f"  {l.id}: {l.recipient_email} - status={l.status}, error={error_msg}")
