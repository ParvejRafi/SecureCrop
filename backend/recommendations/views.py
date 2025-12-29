"""
Views for crop recommendations.
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Recommendation
from .serializers import RecommendationSerializer
from accounts.permissions import IsAdminUser


class RecommendationListView(generics.ListAPIView):
    """
    API endpoint to list recommendations.
    
    GET /api/recommendations/
    - Regular users see only their own recommendations
    - Admins see all recommendations
    """
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Recommendation.objects.all()
        return Recommendation.objects.filter(input__user=user)


class RecommendationDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a specific recommendation.
    
    GET /api/recommendations/<id>/
    """
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Recommendation.objects.all()
        return Recommendation.objects.filter(input__user=user)
