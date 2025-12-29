from django.contrib import admin
from .models import SoilInput


@admin.register(SoilInput)
class SoilInputAdmin(admin.ModelAdmin):
    """Admin configuration for SoilInput model."""
    
    list_display = ('id', 'user', 'N_level', 'P_level', 'K_level', 'ph', 'moisture', 'temperature', 'integrity_hash_short', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('user__username', 'user__email', 'integrity_hash')
    readonly_fields = ('created_at', 'integrity_hash')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Soil Parameters', {
            'fields': ('N_level', 'P_level', 'K_level', 'ph', 'moisture', 'temperature')
        }),
        ('Security', {
            'fields': ('integrity_hash',),
            'description': 'SHA-256 hash for data integrity verification'
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    @admin.display(description='Integrity Hash')
    def integrity_hash_short(self, obj):
        """Display shortened hash in list view."""
        if obj.integrity_hash:
            return f"{obj.integrity_hash[:12]}..."
        return "N/A"
