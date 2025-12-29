"""
URL configuration for soil app.
"""
from django.urls import path
from .views import (
    SoilInputCreateView,
    SoilInputListView,
    SoilInputDetailView,
    AdminSoilInputListView
)

urlpatterns = [
    path('', SoilInputListView.as_view(), name='soil-input-list'),
    path('create/', SoilInputCreateView.as_view(), name='soil-input-create'),
    path('<int:pk>/', SoilInputDetailView.as_view(), name='soil-input-detail'),
    path('admin/all/', AdminSoilInputListView.as_view(), name='admin-soil-input-list'),
]
