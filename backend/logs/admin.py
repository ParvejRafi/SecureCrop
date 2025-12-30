from django.contrib import admin
from .models import AdminLog, CyberLog


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    """Admin configuration for AdminLog model."""
    
    list_display = ('id', 'admin', 'action', 'timestamp')
    list_filter = ('timestamp', 'admin')
    search_fields = ('admin__username', 'action')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)


@admin.register(CyberLog)
class CyberLogAdmin(admin.ModelAdmin):
    """Admin configuration for CyberLog model."""
    
    list_display = ('id', 'anomaly_detected', 'integrity_status', 'get_user', 'timestamp')
    list_filter = ('anomaly_detected', 'integrity_status', 'timestamp')
    search_fields = ('details', 'input__user__username')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
    
    def get_user(self, obj):
        if obj.input and obj.input.user:
            return obj.input.user.username
        return 'N/A'
    get_user.short_description = 'User'
