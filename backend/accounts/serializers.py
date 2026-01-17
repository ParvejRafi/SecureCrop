"""
Serializers for user authentication and management.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data representation."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'role', 'created_at', 'last_login')
        read_only_fields = ('id', 'created_at', 'last_login')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Enforces email-based registration with proper validation.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm')
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        # Basic email validation
        if not value or '@' not in value:
            raise serializers.ValidationError("Enter a valid email address.")
        
        return value.lower()
    
    def validate_username(self, value):
        """Validate username uniqueness and format."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        
        return value
    
    def validate(self, attrs):
        """Validate password match and strength."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate password strength using Django validators
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        
        return attrs
    
    def create(self, validated_data):
        """Create a new user with encrypted password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role='USER'  # Default role for new registrations
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that email exists in the system."""
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with token."""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate password match and strength."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        
        # Validate password strength using Django validators
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return attrs

