from django.contrib import admin
from .models import ModelRegistry


@admin.register(ModelRegistry)
class ModelRegistryAdmin(admin.ModelAdmin):
    """Admin configuration for ModelRegistry model."""
    
    list_display = ('id', 'model_name', 'version', 'accuracy', 'created_at')
    list_filter = ('model_name', 'created_at')
    search_fields = ('model_name', 'version')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
