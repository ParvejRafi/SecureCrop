"""
Automated Weather Alert Service
Fetches real-time weather data for each user's location and sends personalized alerts.
"""
import requests
import os
import threading
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from dotenv import load_dotenv
from accounts.models import User
from .models import WeatherAlertNotification, EmailLog

# Load environment variables
load_dotenv()

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')


def get_weather_for_location(lat, lon):
    """
    Fetch current weather data from OpenWeatherMap for a specific location.
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        dict: Weather data or None if failed
    """
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'temperature': round(data['main']['temp'], 1),
                'feels_like': round(data['main']['feels_like'], 1),
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': round(data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
                'description': data['weather'][0]['description'].title(),
                'icon': data['weather'][0]['icon'],
                'city': data.get('name', 'Your Location'),
                'country': data.get('sys', {}).get('country', ''),
            }
    except Exception as e:
        print(f"Error fetching weather for {lat}, {lon}: {e}")
    
    return None


def get_weather_alerts_for_location(weather_data):
    """
    Generate weather alerts based on current conditions.
    
    Args:
        weather_data: dict with weather information
        
    Returns:
        list: List of alert messages
    """
    alerts = []
    
    if not weather_data:
        return alerts
    
    temp = weather_data['temperature']
    humidity = weather_data['humidity']
    wind_speed = weather_data['wind_speed']
    
    # Temperature alerts
    if temp >= 35:
        alerts.append({
            'type': 'heat_wave',
            'severity': 'danger',
            'message': f"🔥 HEAT WARNING: Temperature is {temp}°C. Protect your crops from heat stress. Water plants early morning or late evening."
        })
    elif temp >= 32:
        alerts.append({
            'type': 'heat_wave',
            'severity': 'warning',
            'message': f"☀️ High Temperature Alert: {temp}°C. Consider shade covers for sensitive crops."
        })
    elif temp <= 5:
        alerts.append({
            'type': 'cold_wave',
            'severity': 'danger',
            'message': f"❄️ FROST WARNING: Temperature is {temp}°C. Protect crops from cold damage. Cover sensitive plants."
        })
    elif temp <= 10:
        alerts.append({
            'type': 'cold_wave',
            'severity': 'warning',
            'message': f"🌡️ Cold Alert: Temperature dropped to {temp}°C. Monitor cold-sensitive crops."
        })
    
    # Humidity alerts
    if humidity >= 90:
        alerts.append({
            'type': 'humidity',
            'severity': 'warning',
            'message': f"💧 High Humidity Alert: {humidity}%. Watch for fungal diseases. Ensure good ventilation."
        })
    elif humidity <= 30:
        alerts.append({
            'type': 'drought',
            'severity': 'warning',
            'message': f"🏜️ Low Humidity Alert: {humidity}%. Increase watering frequency for crops."
        })
    
    # Wind alerts
    if wind_speed >= 50:
        alerts.append({
            'type': 'storm',
            'severity': 'critical',
            'message': f"🌪️ STORM WARNING: Wind speed {wind_speed} km/h. Secure equipment and protect crops!"
        })
    elif wind_speed >= 30:
        alerts.append({
            'type': 'wind',
            'severity': 'warning',
            'message': f"💨 Strong Wind Alert: {wind_speed} km/h. Consider wind barriers for tall crops."
        })
    
    # Rain check from description
    desc_lower = weather_data['description'].lower()
    if 'rain' in desc_lower or 'shower' in desc_lower:
        alerts.append({
            'type': 'heavy_rain',
            'severity': 'info',
            'message': f"🌧️ Rain Expected: {weather_data['description']}. Good time to pause irrigation."
        })
    
    return alerts


def generate_weather_email_html(user, weather_data, alerts):
    """
    Generate personalized weather alert email HTML.
    """
    city = weather_data.get('city', 'Your Location') if weather_data else 'Your Location'
    
    # Generate alerts HTML
    alerts_html = ""
    if alerts:
        for alert in alerts:
            severity_colors = {
                'info': '#17a2b8',
                'warning': '#ffc107',
                'danger': '#dc3545',
                'critical': '#721c24',
            }
            color = severity_colors.get(alert['severity'], '#17a2b8')
            alerts_html += f"""
            <div style="background: {color}15; border-left: 4px solid {color}; padding: 12px; margin: 10px 0; border-radius: 4px;">
                <p style="margin: 0; color: #333;">{alert['message']}</p>
            </div>
            """
    else:
        alerts_html = """
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 10px 0; border-radius: 4px;">
            <p style="margin: 0; color: #155724;">✅ No weather alerts for your location. Conditions are favorable for farming!</p>
        </div>
        """
    
    # Weather data HTML
    if weather_data:
        weather_html = f"""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0;">📍 {city}</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div>
                    <p style="margin: 5px 0; font-size: 32px; font-weight: bold;">{weather_data['temperature']}°C</p>
                    <p style="margin: 0; opacity: 0.9;">Feels like {weather_data['feels_like']}°C</p>
                </div>
                <div style="padding-left: 20px; border-left: 1px solid rgba(255,255,255,0.3);">
                    <p style="margin: 5px 0;">💧 Humidity: {weather_data['humidity']}%</p>
                    <p style="margin: 5px 0;">💨 Wind: {weather_data['wind_speed']} km/h</p>
                    <p style="margin: 5px 0;">☁️ {weather_data['description']}</p>
                </div>
            </div>
        </div>
        """
    else:
        weather_html = """
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #721c24;">⚠️ Unable to fetch weather data for your location. Please update your location in profile settings.</p>
        </div>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌾 SecureCrop</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Daily Weather Alert</p>
        </div>
        
        <div style="background: white; padding: 25px;">
            <p style="font-size: 16px; color: #333;">Hello <strong>{user.username}</strong>,</p>
            <p style="color: #666;">Here's your personalized weather update based on your farm location:</p>
            
            {weather_html}
            
            <h3 style="color: #16a34a; margin-top: 25px; border-bottom: 2px solid #16a34a; padding-bottom: 8px;">
                ⚠️ Weather Alerts
            </h3>
            {alerts_html}
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #16a34a;">💡 Farming Tips</h4>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>Monitor soil moisture regularly</li>
                    <li>Apply fertilizers during cooler parts of the day</li>
                    <li>Check for pest activity during warm, humid weather</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                You received this because you enabled weather alerts in your profile.
            </p>
            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                {timezone.now().strftime('%B %d, %Y at %I:%M %p')}
            </p>
            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                © 2025 SecureCrop - Secure Crop Recommendation System
            </p>
        </div>
    </body>
    </html>
    """
    return html


def send_automated_weather_alert(user, alert_notification=None):
    """
    Send personalized weather alert email to a user based on their location.
    
    Args:
        user: User instance with location_lat and location_lon
        alert_notification: Optional WeatherAlertNotification for logging
        
    Returns:
        EmailLog instance
    """
    # Check if user has location set
    if not user.location_lat or not user.location_lon:
        return None
    
    # Fetch weather for user's location
    weather_data = get_weather_for_location(user.location_lat, user.location_lon)
    
    # Generate weather-based alerts
    alerts = get_weather_alerts_for_location(weather_data)
    
    # Generate email content
    html_content = generate_weather_email_html(user, weather_data, alerts)
    text_content = strip_tags(html_content)
    
    # Create email log if alert notification provided
    email_log = None
    if alert_notification:
        email_log = EmailLog.objects.create(
            alert=alert_notification,
            recipient=user,
            recipient_email=user.email,
            status='pending'
        )
    
    try:
        # Create and send email
        city = weather_data.get('city', 'Your Location') if weather_data else 'Your Location'
        subject = f"🌾 Weather Alert for {city} - SecureCrop"
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        if email_log:
            email_log.status = 'sent'
            email_log.sent_at = timezone.now()
            email_log.save()
        
        return email_log
        
    except Exception as e:
        if email_log:
            email_log.status = 'failed'
            email_log.error_message = str(e)
            email_log.save()
        return email_log


def _send_emails_in_background(users, alert):
    """
    Background task to send emails to avoid worker timeout.
    """
    sent_count = 0
    failed_count = 0
    
    for user in users:
        try:
            result = send_automated_weather_alert(user, alert)
            if result and result.status == 'sent':
                sent_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"Error sending to {user.email}: {e}")
            failed_count += 1
    
    # Update alert with counts
    alert.emails_sent_count = sent_count
    alert.save()
    print(f"Email sending completed: {sent_count} sent, {failed_count} failed")


def send_weather_alerts_to_all_users(admin_user):
    """
    Send automated weather alerts to all users with email alerts enabled and location set.
    Uses background threading to avoid worker timeout.
    
    Args:
        admin_user: Admin user who triggered the send
        
    Returns:
        dict: Summary of email sending initiation
    """
    # Get users with email alerts enabled and location set
    users = User.objects.filter(
        is_active=True,
        receive_email_alerts=True,
        location_lat__isnull=False,
        location_lon__isnull=False
    ).exclude(email='')
    
    if not users.exists():
        return {
            'success': False,
            'message': 'No users with email alerts enabled and location set',
            'total': 0,
            'sent': 0,
            'failed': 0
        }
    
    # Create alert notification record
    alert = WeatherAlertNotification.objects.create(
        title='Automated Weather Alert',
        message='Personalized weather data sent to farmers based on their location',
        alert_type='general',
        severity='info',
        created_by=admin_user,
        target_all_users=True
    )
    
    # Start background thread to send emails
    thread = threading.Thread(
        target=_send_emails_in_background,
        args=(list(users), alert),
        daemon=True
    )
    thread.start()
    
    return {
        'success': True,
        'message': f'Weather alerts are being sent to {users.count()} farmers in the background',
        'alert_id': alert.id,
        'total': users.count(),
        'status': 'processing'
    }


def _send_emails_to_specific_users_in_background(users, alert):
    """
    Background task to send emails to specific users.
    """
    sent_count = 0
    failed_count = 0
    
    for user in users:
        try:
            result = send_automated_weather_alert(user, alert)
            if result and result.status == 'sent':
                sent_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"Error sending to {user.email}: {e}")
            failed_count += 1
    
    # Update alert with counts
    alert.emails_sent_count = sent_count
    alert.save()
    print(f"Targeted email sending completed: {sent_count} sent, {failed_count} failed")


def send_weather_alerts_to_specific_users(admin_user, user_ids):
    """
    Send automated weather alerts to specific users.
    Uses background threading to avoid worker timeout.
    
    Args:
        admin_user: Admin user who triggered the send
        user_ids: List of user IDs
        
    Returns:
        dict: Summary of email sending initiation
    """
    users = User.objects.filter(
        id__in=user_ids,
        is_active=True,
        receive_email_alerts=True,
        location_lat__isnull=False,
        location_lon__isnull=False
    ).exclude(email='')
    
    if not users.exists():
        return {
            'success': False,
            'message': 'No valid users found with the provided IDs',
            'total': 0,
            'sent': 0,
            'failed': 0
        }
    
    # Create alert notification record
    alert = WeatherAlertNotification.objects.create(
        title='Targeted Weather Alert',
        message=f'Personalized weather data sent to {users.count()} selected farmers',
        alert_type='general',
        severity='info',
        created_by=admin_user,
        target_all_users=False
    )
    
    # Set target users
    alert.target_users.set(users)
    alert.save()
    
    # Start background thread to send emails
    thread = threading.Thread(
        target=_send_emails_to_specific_users_in_background,
        args=(list(users), alert),
        daemon=True
    )
    thread.start()
    
    return {
        'success': True,
        'message': f'Weather alerts are being sent to {users.count()} farmers in the background',
        'alert_id': alert.id,
        'total': users.count(),
        'status': 'processing'
    }
