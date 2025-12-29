"""
Test the send_weather_alerts_to_all_users function
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')

import django
django.setup()

from accounts.models import User
from notifications.services import send_weather_alerts_to_all_users

print("=== Testing send_weather_alerts_to_all_users ===")

# Get first admin user
admin = User.objects.filter(role='ADMIN').first()
if admin:
    print(f"Admin user: {admin.username}")
    
    result = send_weather_alerts_to_all_users(admin)
    
    print(f"\nResult:")
    print(f"  success: {result['success']}")
    print(f"  message: {result['message']}")
    print(f"  total: {result.get('total', 0)}")
    print(f"  sent: {result.get('sent', 0)}")
    print(f"  failed: {result.get('failed', 0)}")
else:
    print("No admin user found!")
