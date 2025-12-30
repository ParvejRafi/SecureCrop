"""
URL configuration for SecureCrop project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from .views import IndexView

urlpatterns = [
    # Admin must come before catch-all
    path('admin/', admin.site.urls),
    
    # API endpoints
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

# Add catch-all for frontend (must be last and only in production)
if not settings.DEBUG:
    # Serve React app for all non-admin/api/static/media routes
    urlpatterns += [
        re_path(r'^(?!(admin|api|static|media)/).*$', IndexView.as_view(), name='index'),
    ]
