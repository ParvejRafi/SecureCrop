"""
Soil Input model for storing soil parameter data.
"""
from django.db import models
from django.conf import settings


class SoilInput(models.Model):
    """
    Model to store soil parameter inputs from users.
    
    Fields represent key soil characteristics used for crop recommendation:
    - N_level: Nitrogen content (mg/kg)
    - P_level: Phosphorus content (mg/kg)
    - K_level: Potassium content (mg/kg)
    - ph: Soil pH level (0-14 scale)
    - moisture: Soil moisture percentage (0-100%)
    - temperature: Soil temperature (Celsius)
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='soil_inputs'
    )
    N_level = models.FloatField(help_text='Nitrogen content in mg/kg')
    P_level = models.FloatField(help_text='Phosphorus content in mg/kg')
    K_level = models.FloatField(help_text='Potassium content in mg/kg')
    ph = models.FloatField(help_text='Soil pH level (0-14)')
    moisture = models.FloatField(help_text='Soil moisture percentage (0-100%)')
    temperature = models.FloatField(help_text='Soil temperature in Celsius')
    integrity_hash = models.CharField(
        max_length=64, 
        blank=True, 
        null=True, 
        help_text='SHA-256 hash for data integrity verification'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'soil_inputs'
        ordering = ['-created_at']
        verbose_name = 'Soil Input'
        verbose_name_plural = 'Soil Inputs'
    
    def __str__(self):
        return f"Soil Input #{self.id} by {self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def to_feature_array(self):
        """Convert soil input to feature array for ML model."""
        return [
            self.N_level,
            self.P_level,
            self.K_level,
            self.ph,
            self.moisture,
            self.temperature
        ]
