"""
URL configuration for SecureCrop project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/soil-inputs/', include('soil.urls')),
    path('api/recommendations/', include('recommendations.urls')),
    path('api/feedback/', include('feedback.urls')),
    path('api/admin/logs/', include('logs.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/market/', include('market_linkage.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/notifications/', include('notifications.urls')),
]
