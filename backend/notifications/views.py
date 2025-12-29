"""
API views for notification management.
Admin-only endpoints for sending automated weather alerts to farmers.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUser
from accounts.models import User
from .models import WeatherAlertNotification, EmailLog
from .services import (
    send_weather_alerts_to_all_users,
    send_weather_alerts_to_specific_users,
    get_weather_for_location
)


class AlertEligibleUsersView(APIView):
    """
    GET: List all users eligible for weather alerts.
    (Users with email alerts enabled AND location set)
    Admin only.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Users with email alerts and location
        users = User.objects.filter(
            is_active=True,
            receive_email_alerts=True,
            location_lat__isnull=False,
            location_lon__isnull=False
        ).exclude(email='').order_by('username')
        
        user_list = []
        for user in users:
            # Optionally fetch weather preview
            weather = get_weather_for_location(user.location_lat, user.location_lon)
            user_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'location_lat': user.location_lat,
                'location_lon': user.location_lon,
                'weather_preview': {
                    'temperature': weather['temperature'] if weather else None,
                    'description': weather['description'] if weather else None,
                    'city': weather['city'] if weather else None
                } if weather else None
            })
        
        # Also get users with alerts enabled but no location
        users_no_location = User.objects.filter(
            is_active=True,
            receive_email_alerts=True
        ).filter(
            location_lat__isnull=True
        ) | User.objects.filter(
            is_active=True,
            receive_email_alerts=True
        ).filter(
            location_lon__isnull=True
        )
        
        return Response({
            'eligible_users': {
                'count': len(user_list),
                'users': user_list
            },
            'users_without_location': {
                'count': users_no_location.count(),
                'message': 'These users have alerts enabled but no location set'
            }
        })


class SendWeatherAlertsView(APIView):
    """
    POST: Send automated weather alerts to all eligible users or specific users.
    Admin only.
    
    Request body:
    {
        "send_to_all": true  // Sends to all eligible users
    }
    OR
    {
        "send_to_all": false,
        "user_ids": [1, 2, 3]  // Sends to specific users
    }
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        send_to_all = request.data.get('send_to_all', True)
        
        if send_to_all:
            result = send_weather_alerts_to_all_users(request.user)
        else:
            user_ids = request.data.get('user_ids', [])
            if not user_ids:
                return Response({
                    'error': 'user_ids required when send_to_all is false'
                }, status=status.HTTP_400_BAD_REQUEST)
            result = send_weather_alerts_to_specific_users(request.user, user_ids)
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class AlertHistoryView(APIView):
    """
    GET: Get history of sent weather alerts.
    Admin only.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        alerts = WeatherAlertNotification.objects.all()[:50]
        
        alert_list = [{
            'id': alert.id,
            'title': alert.title,
            'message': alert.message[:100] + '...' if len(alert.message) > 100 else alert.message,
            'alert_type': alert.alert_type,
            'severity': alert.severity,
            'created_by': alert.created_by.username if alert.created_by else 'System',
            'created_at': alert.created_at.isoformat(),
            'emails_sent_count': alert.emails_sent_count,
            'target_all_users': alert.target_all_users
        } for alert in alerts]
        
        return Response({
            'total': len(alert_list),
            'alerts': alert_list
        })


class AlertDetailView(APIView):
    """
    GET: Get details of a specific alert including email logs.
    Admin only.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request, alert_id):
        try:
            alert = WeatherAlertNotification.objects.get(id=alert_id)
        except WeatherAlertNotification.DoesNotExist:
            return Response({
                'error': 'Alert not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        email_logs = alert.email_logs.all().order_by('-sent_at')[:100]
        
        return Response({
            'alert': {
                'id': alert.id,
                'title': alert.title,
                'message': alert.message,
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'created_by': alert.created_by.username if alert.created_by else 'System',
                'created_at': alert.created_at.isoformat(),
                'emails_sent_count': alert.emails_sent_count,
                'target_all_users': alert.target_all_users
            },
            'email_logs': [{
                'id': log.id,
                'recipient_email': log.recipient_email,
                'recipient_name': log.recipient.username if log.recipient else 'Unknown',
                'status': log.status,
                'sent_at': log.sent_at.isoformat() if log.sent_at else None,
                'error_message': log.error_message
            } for log in email_logs]
        })


class AlertStatsView(APIView):
    """
    GET: Get statistics for admin dashboard.
    Admin only.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # User stats
        total_users = User.objects.filter(is_active=True, role='USER').count()
        email_enabled = User.objects.filter(is_active=True, receive_email_alerts=True).count()
        with_location = User.objects.filter(
            is_active=True,
            receive_email_alerts=True,
            location_lat__isnull=False,
            location_lon__isnull=False
        ).exclude(email='').count()
        
        # Alert stats
        total_alerts = WeatherAlertNotification.objects.count()
        total_emails_sent = EmailLog.objects.filter(status='sent').count()
        total_emails_failed = EmailLog.objects.filter(status='failed').count()
        
        # Recent alerts
        recent_alerts = WeatherAlertNotification.objects.all()[:5]
        
        return Response({
            'users': {
                'total_farmers': total_users,
                'email_alerts_enabled': email_enabled,
                'eligible_for_weather_alerts': with_location,
                'need_to_set_location': email_enabled - with_location
            },
            'alerts': {
                'total_sent': total_alerts,
                'total_emails_delivered': total_emails_sent,
                'total_emails_failed': total_emails_failed
            },
            'recent_alerts': [{
                'id': a.id,
                'title': a.title,
                'emails_sent': a.emails_sent_count,
                'created_at': a.created_at.isoformat()
            } for a in recent_alerts]
        })
