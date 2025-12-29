"""
Weather Models
Store weather data history for farmers
"""
from django.db import models
from django.conf import settings


class WeatherLog(models.Model):
    """Store weather data for each farmer location check"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weather_logs'
    )
    
    # Location data
    latitude = models.FloatField()
    longitude = models.FloatField()
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=50, default='MY')
    
    # Weather data
    temperature = models.FloatField()
    feels_like = models.FloatField(null=True, blank=True)
    humidity = models.IntegerField()
    pressure = models.IntegerField(null=True, blank=True)
    wind_speed = models.FloatField()
    wind_direction = models.IntegerField(null=True, blank=True)
    description = models.CharField(max_length=200)
    weather_icon = models.CharField(max_length=10, blank=True)
    clouds = models.IntegerField(default=0)
    visibility = models.FloatField(null=True, blank=True)  # in km
    
    # Timestamps
    recorded_at = models.DateTimeField(auto_now_add=True)
    weather_timestamp = models.IntegerField(null=True, blank=True)  # Unix timestamp from API
    
    class Meta:
        ordering = ['-recorded_at']
        verbose_name = 'Weather Log'
        verbose_name_plural = 'Weather Logs'
    
    def __str__(self):
        return f"{self.user.email} - {self.city} - {self.temperature}°C on {self.recorded_at}"


class WeatherAlert(models.Model):
    """Store weather alerts sent to farmers"""
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    ALERT_TYPES = [
        ('heat_warning', 'Heat Warning'),
        ('cold_warning', 'Cold Warning'),
        ('rain_alert', 'Rain Alert'),
        ('storm_warning', 'Storm Warning'),
        ('humidity_warning', 'Humidity Warning'),
        ('wind_warning', 'Wind Warning'),
        ('drought_risk', 'Drought Risk'),
        ('frost_warning', 'Frost Warning'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weather_alerts'
    )
    
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Weather Alert'
        verbose_name_plural = 'Weather Alerts'
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class ForecastLog(models.Model):
    """Store forecast data history"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='forecast_logs'
    )
    
    latitude = models.FloatField()
    longitude = models.FloatField()
    city = models.CharField(max_length=100, blank=True)
    
    # Forecast data (stored as JSON)
    forecast_date = models.DateField()
    temperature_min = models.FloatField()
    temperature_max = models.FloatField()
    humidity = models.IntegerField()
    condition = models.CharField(max_length=200)
    rain_probability = models.FloatField(default=0)
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
        verbose_name = 'Forecast Log'
        verbose_name_plural = 'Forecast Logs'
    
    def __str__(self):
        return f"{self.user.email} - {self.city} - {self.forecast_date}"
