"""
Models for logging system activities and security events.
"""
from django.db import models
from django.conf import settings
from soil.models import SoilInput


class AdminLog(models.Model):
    """
    Model to log administrative actions.
    
    Fields:
    - admin: Admin user who performed the action
    - action: Description of the action
    - timestamp: When the action occurred
    """
    
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'ADMIN'},
        related_name='admin_logs'
    )
    action = models.TextField(help_text='Description of admin action')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_logs'
        ordering = ['-timestamp']
        verbose_name = 'Admin Log'
        verbose_name_plural = 'Admin Logs'
    
    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.admin.username}: {self.action[:50]}"


class CyberLog(models.Model):
    """
    Model to log cybersecurity events and anomalies.
    
    Fields:
    - input: Related soil input (optional)
    - anomaly_detected: Whether an anomaly was detected
    - integrity_status: Status of data integrity check
    - details: Detailed description of the event
    - timestamp: When the event occurred
    """
    
    INTEGRITY_STATUS_CHOICES = [
        ('OK', 'OK'),
        ('ANOMALY', 'Anomaly Detected'),
        ('OUT_OF_RANGE', 'Out of Range'),
        ('LOW_CONFIDENCE', 'Low Confidence'),
        ('TAMPERED', 'Tampered'),
    ]
    
    input = models.ForeignKey(
        SoilInput,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cyber_logs'
    )
    anomaly_detected = models.BooleanField(default=False)
    integrity_status = models.CharField(
        max_length=20,
        choices=INTEGRITY_STATUS_CHOICES,
        default='OK'
    )
    details = models.TextField(help_text='Detailed description of the security event')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cyber_logs'
        ordering = ['-timestamp']
        verbose_name = 'Cyber Log'
        verbose_name_plural = 'Cyber Logs'
    
    def __str__(self):
        status_icon = "⚠️" if self.anomaly_detected else "✓"
        return f"{status_icon} [{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.integrity_status}: {self.details[:50]}"
