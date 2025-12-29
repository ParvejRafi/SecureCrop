"""Weather API URL Configuration"""
from django.urls import path
from .views import (
    CurrentWeatherView,
    ForecastView,
    AlertsView,
    RiskScoreView,
    InsightsView,
    HistoryView,
    LocationView,
)

urlpatterns = [
    path('current/', CurrentWeatherView.as_view(), name='current-weather'),
    path('forecast/', ForecastView.as_view(), name='forecast'),
    path('alerts/', AlertsView.as_view(), name='alerts'),
    path('risk-score/', RiskScoreView.as_view(), name='risk-score'),
    path('insights/', InsightsView.as_view(), name='insights'),
    path('history/', HistoryView.as_view(), name='history'),
    path('location/', LocationView.as_view(), name='location'),
]
