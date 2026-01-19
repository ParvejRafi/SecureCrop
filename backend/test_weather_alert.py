"""
Direct test of weather alert email - with better output
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')

import django
django.setup()

from accounts.models import User
from notifications.services import send_automated_weather_alert

print("=== Finding eligible user ===")
user = User.objects.filter(
    is_active=True,
    receive_email_alerts=True,
    location_lat__isnull=False,
    location_lon__isnull=False
).exclude(email='').first()

if user:
    print(f"User: {user.username}")
    print(f"Email: {user.email}")
    print(f"Location: {user.location_lat}, {user.location_lon}")
    
    print("\n=== Sending weather alert via Brevo API ===")
    try:
        result = send_automated_weather_alert(user)
        if result:
            if hasattr(result, 'status'):
                print(f"✅ SUCCESS! Email log created with status: {result.status}")
            else:
                print(f"✅ SUCCESS! Weather alert email sent successfully!")
        else:
            print("⚠️ No email sent (user may not have location set)")
    except Exception as e:
        print(f"❌ FAILED: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No eligible user found!")
