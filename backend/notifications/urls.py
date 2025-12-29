"""
URL configuration for notifications app.
"""
from django.urls import path
from .views import (
    AlertEligibleUsersView,
    SendWeatherAlertsView,
    AlertHistoryView,
    AlertDetailView,
    AlertStatsView
)

urlpatterns = [
    # Admin endpoints for automated weather alerts
    path('eligible-users/', AlertEligibleUsersView.as_view(), name='eligible-users'),
    path('send-alerts/', SendWeatherAlertsView.as_view(), name='send-alerts'),
    path('history/', AlertHistoryView.as_view(), name='alert-history'),
    path('stats/', AlertStatsView.as_view(), name='alert-stats'),
    path('<int:alert_id>/', AlertDetailView.as_view(), name='alert-detail'),
]
