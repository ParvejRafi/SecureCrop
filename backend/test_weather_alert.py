"""
Direct test of weather alert email - with better output
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')

import django
django.setup()

from accounts.models import User
from notifications.services import get_weather_for_location, get_weather_alerts_for_location, generate_weather_email_html
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

print("=== Email Settings ===")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD length: {len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 0}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

print("\n=== Finding eligible user ===")
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
    
    print("\n=== Fetching weather ===")
    weather_data = get_weather_for_location(user.location_lat, user.location_lon)
    if weather_data:
        print(f"City: {weather_data['city']}")
        print(f"Temp: {weather_data['temperature']}°C")
        print(f"Description: {weather_data['description']}")
    else:
        print("Failed to fetch weather data!")
        exit(1)
    
    print("\n=== Generating alerts ===")
    alerts = get_weather_alerts_for_location(weather_data)
    print(f"Generated {len(alerts)} alerts")
    for alert in alerts:
        print(f"  - {alert['type']}: {alert['message'][:50]}...")
    
    print("\n=== Sending email directly ===")
    html_content = generate_weather_email_html(user, weather_data, alerts)
    text_content = strip_tags(html_content)
    
    city = weather_data.get('city', 'Your Location')
    subject = f"🌾 Weather Alert for {city} - SecureCrop"
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        result = email.send(fail_silently=False)
        print(f"SUCCESS! Email sent. Result: {result}")
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")
else:
    print("No eligible user found!")
