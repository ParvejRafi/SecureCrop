"""
URL configuration for feedback app.
"""
from django.urls import path
from .views import FeedbackCreateView, FeedbackListView, AdminFeedbackStatsView

urlpatterns = [
    path('', FeedbackListView.as_view(), name='feedback-list'),
    path('create/', FeedbackCreateView.as_view(), name='feedback-create'),
    path('stats/', AdminFeedbackStatsView.as_view(), name='feedback-stats'),
]
