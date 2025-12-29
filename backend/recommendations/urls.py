"""
URL configuration for recommendations app.
"""
from django.urls import path
from .views import RecommendationListView, RecommendationDetailView

urlpatterns = [
    path('', RecommendationListView.as_view(), name='recommendation-list'),
    path('<int:pk>/', RecommendationDetailView.as_view(), name='recommendation-detail'),
]
