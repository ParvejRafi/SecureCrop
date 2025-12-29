"""Market Linkage API URL Configuration"""
from django.urls import path
from .views import SearchAllView

urlpatterns = [
    path('search/all/', SearchAllView.as_view(), name='search-all'),
]
