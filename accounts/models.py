"""
Custom User model for SecureCrop.
Implements role-based access control (RBAC) with USER and ADMIN roles.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


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
