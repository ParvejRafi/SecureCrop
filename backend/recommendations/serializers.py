"""
Serializers for crop recommendations.
"""
from rest_framework import serializers
from .models import Recommendation
from soil.serializers import SoilInputSerializer


class RecommendationSerializer(serializers.ModelSerializer):
    """Serializer for Recommendation model with related soil input data."""
    
    soil_input = SoilInputSerializer(source='input', read_only=True)
    user_email = serializers.EmailField(source='input.user.email', read_only=True)
    
    class Meta:
        model = Recommendation
        fields = ['id', 'input', 'soil_input', 'user_email', 'crop_name', 'explanation', 'created_at']
        read_only_fields = ['id', 'created_at']
