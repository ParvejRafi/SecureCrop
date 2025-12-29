"""
Model registry for tracking ML model versions and performance.
"""
from django.db import models


class ModelRegistry(models.Model):
    """
    Model to track trained ML model versions and metadata.
    
    Fields:
    - model_name: Name of the model algorithm
    - version: Version identifier
    - accuracy: Model accuracy score
    - file_path: Path to saved model file
    - created_at: When the model was trained
    """
    
    model_name = models.CharField(max_length=100, help_text='Model algorithm name')
    version = models.CharField(max_length=50, help_text='Model version')
    accuracy = models.FloatField(help_text='Model accuracy score')
    file_path = models.CharField(max_length=500, help_text='Path to saved model file')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'model_registry'
        ordering = ['-created_at']
        verbose_name = 'Model Registry'
        verbose_name_plural = 'Model Registry'
    
    def __str__(self):
        return f"{self.model_name} v{self.version} - Accuracy: {self.accuracy:.4f}"
