from django.contrib import admin
from .models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    """Admin configuration for Recommendation model."""
    
    list_display = ('id', 'crop_name', 'get_user', 'created_at')
    list_filter = ('crop_name', 'created_at')
    search_fields = ('crop_name', 'input__user__username', 'input__user__email')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    
    def get_user(self, obj):
        return obj.input.user.username
    get_user.short_description = 'User'
