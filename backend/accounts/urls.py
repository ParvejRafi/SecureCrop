"""
URL configuration for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, 
    LoginView, 
    CurrentUserView, 
    ProfileView, 
    ProfilePictureUploadView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordResetVerifyTokenView,
    AdminUserListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/picture/', ProfilePictureUploadView.as_view(), name='profile-picture'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password Reset URLs
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password-reset/verify/', PasswordResetVerifyTokenView.as_view(), name='password-reset-verify'),
    
    # Admin URLs
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
]

