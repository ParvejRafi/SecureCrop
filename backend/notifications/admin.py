from django.contrib import admin
from .models import WeatherAlertNotification, EmailLog


@admin.register(WeatherAlertNotification)
class WeatherAlertNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'severity', 'created_by', 'emails_sent_count', 'created_at', 'is_active']
    list_filter = ['alert_type', 'severity', 'is_active', 'created_at']
    search_fields = ['title', 'message', 'created_by__username']
    date_hierarchy = 'created_at'
    readonly_fields = ['emails_sent_count', 'created_at']
    
    fieldsets = (
        ('Alert Content', {
            'fields': ('title', 'message', 'alert_type', 'severity')
        }),
        ('Targeting', {
            'fields': ('target_all_users', 'target_users')
        }),
        ('Status', {
            'fields': ('is_active', 'expires_at', 'emails_sent_count', 'created_at', 'created_by')
        }),
    )
    filter_horizontal = ('target_users',)


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['recipient_email', 'alert', 'status', 'sent_at', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['recipient_email', 'alert__title']
    date_hierarchy = 'created_at'
    readonly_fields = ['alert', 'recipient', 'recipient_email', 'status', 'error_message', 'sent_at', 'created_at']
