"""
Serializers for log models.
"""
from rest_framework import serializers
from .models import AdminLog, CyberLog


class AdminLogSerializer(serializers.ModelSerializer):
    """Serializer for AdminLog model."""
    
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    admin_email = serializers.EmailField(source='admin.email', read_only=True)
    
    class Meta:
        model = AdminLog
        fields = ['id', 'admin', 'admin_username', 'admin_email', 'action', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class CyberLogSerializer(serializers.ModelSerializer):
    """Serializer for CyberLog model."""
    
    input_id = serializers.IntegerField(source='input.id', read_only=True, allow_null=True)
    user_username = serializers.SerializerMethodField()
    
    class Meta:
        model = CyberLog
        fields = [
            'id', 'input', 'input_id', 'user_username',
            'anomaly_detected', 'integrity_status', 'details', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_user_username(self, obj):
        """Get username of the user who created the input."""
        if obj.input and obj.input.user:
            return obj.input.user.username
        return None
