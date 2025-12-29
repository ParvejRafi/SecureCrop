from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContactInquiryViewSet,
    AdminInquiryListView,
    AdminInquiryDetailView,
    AdminInquiryUpdateView,
    AdminInquiryReplyView,
    AdminInquiryStatsView,
)

router = DefaultRouter()
router.register(r'inquiries', ContactInquiryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Admin endpoints
    path('admin/list/', AdminInquiryListView.as_view(), name='admin-inquiry-list'),
    path('admin/stats/', AdminInquiryStatsView.as_view(), name='admin-inquiry-stats'),
    path('admin/<int:inquiry_id>/', AdminInquiryDetailView.as_view(), name='admin-inquiry-detail'),
    path('admin/<int:inquiry_id>/update/', AdminInquiryUpdateView.as_view(), name='admin-inquiry-update'),
    path('admin/<int:inquiry_id>/reply/', AdminInquiryReplyView.as_view(), name='admin-inquiry-reply'),
]
