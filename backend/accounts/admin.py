from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model."""
    
    list_display = ('email', 'username', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'username')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'created_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ('created_at', 'last_login')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin configuration for PasswordResetToken model."""
    
    list_display = ('user', 'token_preview', 'created_at', 'expires_at', 'used', 'is_valid_status')
    list_filter = ('used', 'created_at', 'expires_at')
    search_fields = ('user__email', 'user__username', 'token')
    readonly_fields = ('token', 'created_at', 'expires_at')
    ordering = ('-created_at',)
    
    def token_preview(self, obj):
        """Show first 10 characters of token for preview."""
        return f"{obj.token[:10]}..."
    token_preview.short_description = 'Token'
    
    def is_valid_status(self, obj):
        """Show if token is currently valid."""
        return '✓ Valid' if obj.is_valid() else '✗ Invalid'
    is_valid_status.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Prevent manual creation of tokens through admin."""
        return False

