"""
Custom User model for SecureCrop.
Implements role-based access control (RBAC) with USER and ADMIN roles.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
import secrets
from datetime import timedelta


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, username, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email-based authentication and role-based access control.
    
    Fields:
        - email: Unique email address (used for authentication)
        - username: Unique username for display
        - role: USER or ADMIN
        - phone_number: For SMS alerts
        - location_lat/lon: User's farm location
        - receive_email_alerts: Enable/disable email weather alerts
        - receive_sms_alerts: Enable/disable SMS weather alerts
        - created_at: Account creation timestamp
        - is_active: Account activation status
        - is_staff: Staff status for Django admin access
    """
    
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    ]
    
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True, db_index=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    
    # Contact information
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Location for weather alerts
    location_lat = models.FloatField(null=True, blank=True)
    location_lon = models.FloatField(null=True, blank=True)
    
    # Alert preferences
    receive_email_alerts = models.BooleanField(default=False)
    receive_sms_alerts = models.BooleanField(default=False)
    
    # Profile picture
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def is_admin(self):
        """Check if user has admin role."""
        return self.role == 'ADMIN'
    
    def can_receive_email_alerts(self):
        """Check if user can receive email alerts."""
        return self.is_active and self.receive_email_alerts and self.email
    
    def can_receive_sms_alerts(self):
        """Check if user can receive SMS alerts."""
        return self.is_active and self.receive_sms_alerts and self.phone_number


class PasswordResetToken(models.Model):
    """
    Model for storing password reset tokens.
    Tokens expire after 1 hour for security.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
    
    def __str__(self):
        return f"Reset token for {self.user.email} - {'Used' if self.used else 'Active'}"
    
    def is_valid(self):
        """Check if token is still valid (not expired and not used)."""
        return not self.used and timezone.now() < self.expires_at
    
    @classmethod
    def create_token(cls, user):
        """Create a new password reset token for a user."""
        # Generate a secure random token
        token = secrets.token_urlsafe(32)
        
        # Set expiration to 1 hour from now
        expires_at = timezone.now() + timedelta(hours=1)
        
        # Create and return the token
        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

