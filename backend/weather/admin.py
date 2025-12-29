from django.contrib import admin
from .models import WeatherLog, WeatherAlert, ForecastLog


@admin.register(WeatherLog)
class WeatherLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'temperature', 'humidity', 'description', 'recorded_at']
    list_filter = ['city', 'recorded_at']
    search_fields = ['user__email', 'city', 'description']
    date_hierarchy = 'recorded_at'


@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'alert_type', 'severity', 'title', 'is_read', 'created_at']
    list_filter = ['alert_type', 'severity', 'is_read', 'is_active']
    search_fields = ['user__email', 'title', 'description']
    date_hierarchy = 'created_at'


@admin.register(ForecastLog)
class ForecastLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'forecast_date', 'temperature_min', 'temperature_max', 'condition']
    list_filter = ['city', 'forecast_date']
    search_fields = ['user__email', 'city']
    date_hierarchy = 'recorded_at'
