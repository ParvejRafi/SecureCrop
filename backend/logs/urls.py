"""
URL configuration for logs app.
"""
from django.urls import path
from .views import AdminLogListView, CyberLogListView, CyberLogStatsView

urlpatterns = [
    path('admin-actions/', AdminLogListView.as_view(), name='admin-log-list'),
    path('cyber/', CyberLogListView.as_view(), name='cyber-log-list'),
    path('cyber/stats/', CyberLogStatsView.as_view(), name='cyber-log-stats'),
]
