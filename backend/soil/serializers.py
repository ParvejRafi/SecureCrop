"""
Serializers for soil input validation and data transformation.
"""
from rest_framework import serializers
from .models import SoilInput


class SoilInputSerializer(serializers.ModelSerializer):
    """
    Serializer for SoilInput with comprehensive validation.
    
    Validates all soil parameters against realistic ranges:
    - N, P, K: 0-200 mg/kg
    - pH: 0-14
    - Moisture: 0-100%
    - Temperature: -10 to 60°C
    """
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SoilInput
        fields = [
            'id', 'user', 'user_email', 'user_username',
            'N_level', 'P_level', 'K_level', 
            'ph', 'moisture', 'temperature',
            'integrity_hash', 'created_at'
        ]
        read_only_fields = ('id', 'user', 'integrity_hash', 'created_at')
    
    def validate_N_level(self, value):
        """Validate nitrogen level range."""
        if value < 0 or value > 200:
            raise serializers.ValidationError(
                "Nitrogen level must be between 0 and 200 mg/kg"
            )
        return value
    
    def validate_P_level(self, value):
        """Validate phosphorus level range."""
        if value < 0 or value > 200:
            raise serializers.ValidationError(
                "Phosphorus level must be between 0 and 200 mg/kg"
            )
        return value
    
    def validate_K_level(self, value):
        """Validate potassium level range."""
        if value < 0 or value > 200:
            raise serializers.ValidationError(
                "Potassium level must be between 0 and 200 mg/kg"
            )
        return value
    
    def validate_ph(self, value):
        """Validate pH level range."""
        if value < 0 or value > 14:
            raise serializers.ValidationError(
                "pH level must be between 0 and 14"
            )
        return value
    
    def validate_moisture(self, value):
        """Validate moisture percentage range."""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Moisture must be between 0 and 100%"
            )
        return value
    
    def validate_temperature(self, value):
        """Validate temperature range."""
        if value < -10 or value > 60:
            raise serializers.ValidationError(
                "Temperature must be between -10 and 60°C"
            )
        return value
    
    def validate(self, attrs):
        """Additional cross-field validation."""
        # Check for unrealistic combinations
        if attrs.get('moisture', 0) > 80 and attrs.get('temperature', 0) > 40:
            raise serializers.ValidationError(
                "High moisture (>80%) with high temperature (>40°C) is unrealistic"
            )
        
        return attrs
