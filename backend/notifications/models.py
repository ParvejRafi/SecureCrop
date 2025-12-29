"""
Notification models for storing weather alerts and email logs.
"""
from django.db import models
from django.conf import settings


class WeatherAlertNotification(models.Model):
    """
    Model for storing weather alert notifications sent by admin.
    """
    SEVERITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('danger', 'Danger'),
        ('critical', 'Critical'),
    ]
    
    ALERT_TYPE_CHOICES = [
        ('heat_wave', 'Heat Wave'),
        ('cold_wave', 'Cold Wave'),
        ('heavy_rain', 'Heavy Rain'),
        ('flood', 'Flood Warning'),
        ('drought', 'Drought'),
        ('storm', 'Storm'),
        ('wind', 'Strong Wind'),
        ('general', 'General Weather'),
    ]
    
    # Alert content
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES, default='general')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    
    # Who created it
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_alerts'
    )
    
    # Targeting
    target_all_users = models.BooleanField(default=True)
    target_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='received_alerts'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    emails_sent_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Weather Alert Notification'
        verbose_name_plural = 'Weather Alert Notifications'
    
    def __str__(self):
        return f"[{self.severity.upper()}] {self.title}"


class EmailLog(models.Model):
    """
    Log of all emails sent for weather alerts.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    alert = models.ForeignKey(
        WeatherAlertNotification,
        on_delete=models.CASCADE,
        related_name='email_logs'
    )
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_email_logs'
    )
    
    recipient_email = models.EmailField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True)
    
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'
    
    def __str__(self):
        return f"Email to {self.recipient_email} - {self.status}"
