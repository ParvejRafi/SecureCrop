"""
Serializers for user feedback.
"""
from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for Feedback model."""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'user', 'user_username', 'user_email', 'rating', 'comments', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def validate_rating(self, value):
        """Ensure rating is between 1 and 5."""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
