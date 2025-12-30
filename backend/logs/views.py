"""
Views for log management (admin-only access).
"""
from rest_framework import generics
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import AdminLog, CyberLog
from .serializers import AdminLogSerializer, CyberLogSerializer
from accounts.permissions import IsAdminUser


class AdminLogListView(generics.ListAPIView):
    """
    Admin-only endpoint to list all admin action logs.
    
    GET /api/admin/logs/admin-actions/
    """
    serializer_class = AdminLogSerializer
    permission_classes = [IsAdminUser]
    queryset = AdminLog.objects.all()


class CyberLogListView(generics.ListAPIView):
    """
    Admin-only endpoint to list all cyber security logs.
    
    GET /api/admin/logs/cyber/
    Supports filtering by anomaly_detected, integrity_status
    """
    serializer_class = CyberLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = CyberLog.objects.all()
        
        # Filter by anomaly_detected
        anomaly = self.request.query_params.get('anomaly_detected', None)
        if anomaly is not None:
            anomaly_bool = anomaly.lower() == 'true'
            queryset = queryset.filter(anomaly_detected=anomaly_bool)
        
        # Filter by integrity_status
        status = self.request.query_params.get('integrity_status', None)
        if status:
            queryset = queryset.filter(integrity_status=status)
        
        return queryset


class CyberLogStatsView(generics.GenericAPIView):
    """
    Admin-only endpoint to get cyber log statistics.
    
    GET /api/admin/logs/cyber/stats/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_logs = CyberLog.objects.count()
        anomalies = CyberLog.objects.filter(anomaly_detected=True).count()
        
        # Count by integrity status
        status_counts = CyberLog.objects.values('integrity_status').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_logs': total_logs,
            'anomalies_detected': anomalies,
            'anomaly_rate': round((anomalies / total_logs * 100), 2) if total_logs > 0 else 0,
            'status_breakdown': list(status_counts)
        })
