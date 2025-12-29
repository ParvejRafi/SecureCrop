from django.contrib import admin
from .models import ContactInquiry


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'category', 'created_at', 'is_resolved']
    list_filter = ['category', 'is_resolved', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
