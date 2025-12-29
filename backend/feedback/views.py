"""
Views for user feedback.
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer
from accounts.permissions import IsAdminUser


class FeedbackCreateView(generics.CreateAPIView):
    """
    API endpoint for users to submit feedback.
    
    POST /api/feedback/
    - Requires authentication
    - Users can submit rating and comments
    """
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        
        return Response({
            'feedback': serializer.data,
            'message': 'Thank you for your feedback!'
        }, status=status.HTTP_201_CREATED)


class FeedbackListView(generics.ListAPIView):
    """
    API endpoint to list feedbacks.
    
    GET /api/feedback/
    - Regular users see only their own feedback
    - Admins see all feedback
    """
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Feedback.objects.all()
        return Feedback.objects.filter(user=user)


class AdminFeedbackStatsView(generics.GenericAPIView):
    """
    Admin-only endpoint to get feedback statistics.
    
    GET /api/feedback/stats/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Avg, Count
        
        stats = Feedback.objects.aggregate(
            total_feedbacks=Count('id'),
            average_rating=Avg('rating')
        )
        
        return Response(stats)
