"""
Feedback model for user ratings and comments.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Feedback(models.Model):
    """
    Model to store user feedback about the system.
    
    Fields:
    - user: User who submitted feedback
    - rating: Rating from 1-5
    - comments: Optional text feedback
    - created_at: Timestamp of feedback submission
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5'
    )
    comments = models.TextField(blank=True, help_text='Optional feedback comments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'feedbacks'
        ordering = ['-created_at']
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedbacks'
    
    def __str__(self):
        return f"Feedback from {self.user.username} - Rating: {self.rating}/5"
