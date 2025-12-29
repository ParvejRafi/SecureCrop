"""
Contact API Views
Provides endpoints for contact form submissions and admin management.
"""
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.conf import settings
from accounts.permissions import IsAdminUser
from .models import ContactInquiry
from .serializers import ContactInquirySerializer


class ContactInquiryViewSet(viewsets.ModelViewSet):
    """ViewSet for handling contact form submissions (public)"""
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Thank you for contacting us! We will get back to you soon.', 'data': serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminInquiryListView(APIView):
    """Admin view - list all inquiries with stats"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get query params for filtering
        status_filter = request.query_params.get('status', None)
        category_filter = request.query_params.get('category', None)
        
        inquiries = ContactInquiry.objects.all()
        
        if status_filter:
            inquiries = inquiries.filter(status=status_filter)
        if category_filter:
            inquiries = inquiries.filter(category=category_filter)
        
        # Stats
        total = ContactInquiry.objects.count()
        pending = ContactInquiry.objects.filter(status='pending').count()
        in_progress = ContactInquiry.objects.filter(status='in_progress').count()
        resolved = ContactInquiry.objects.filter(status='resolved').count()
        
        inquiry_list = [{
            'id': inq.id,
            'name': inq.name,
            'email': inq.email,
            'phone': inq.phone,
            'subject': inq.subject,
            'message': inq.message[:200] + '...' if len(inq.message) > 200 else inq.message,
            'category': inq.category,
            'status': inq.status,
            'created_at': inq.created_at.isoformat(),
            'has_reply': bool(inq.admin_reply),
            'replied_by': inq.replied_by.username if inq.replied_by else None,
            'replied_at': inq.replied_at.isoformat() if inq.replied_at else None,
        } for inq in inquiries[:50]]
        
        return Response({
            'stats': {
                'total': total,
                'pending': pending,
                'in_progress': in_progress,
                'resolved': resolved,
            },
            'inquiries': inquiry_list
        })


class AdminInquiryDetailView(APIView):
    """Admin view - get single inquiry details"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, inquiry_id):
        try:
            inq = ContactInquiry.objects.get(id=inquiry_id)
        except ContactInquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'id': inq.id,
            'name': inq.name,
            'email': inq.email,
            'phone': inq.phone,
            'subject': inq.subject,
            'message': inq.message,
            'category': inq.category,
            'status': inq.status,
            'created_at': inq.created_at.isoformat(),
            'updated_at': inq.updated_at.isoformat(),
            'admin_reply': inq.admin_reply,
            'replied_by': inq.replied_by.username if inq.replied_by else None,
            'replied_at': inq.replied_at.isoformat() if inq.replied_at else None,
        })


class AdminInquiryUpdateView(APIView):
    """Admin view - update inquiry status"""
    permission_classes = [IsAdminUser]
    
    def patch(self, request, inquiry_id):
        try:
            inq = ContactInquiry.objects.get(id=inquiry_id)
        except ContactInquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        if new_status and new_status in ['pending', 'in_progress', 'resolved', 'closed']:
            inq.status = new_status
            inq.save()
            return Response({'message': 'Status updated successfully', 'status': inq.status})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)


class AdminInquiryReplyView(APIView):
    """Admin view - reply to user inquiry via email"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, inquiry_id):
        try:
            inq = ContactInquiry.objects.get(id=inquiry_id)
        except ContactInquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)
        
        reply_message = request.data.get('reply', '').strip()
        if not reply_message:
            return Response({'error': 'Reply message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Build email HTML
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🌾 SecureCrop Support</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Response to Your Inquiry</p>
            </div>
            
            <div style="background: white; padding: 25px; border: 1px solid #e5e7eb;">
                <p style="color: #333;">Hello <strong>{inq.name}</strong>,</p>
                
                <p style="color: #666;">Thank you for reaching out to us. Here is our response to your inquiry:</p>
                
                <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #15803d;">Your Original Message:</p>
                    <p style="margin: 0; color: #166534; font-style: italic;">"{inq.subject}"</p>
                </div>
                
                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #1d4ed8;">Our Response:</p>
                    <p style="margin: 0; color: #1e40af; white-space: pre-line;">{reply_message}</p>
                </div>
                
                <p style="color: #666;">If you have any further questions, please don't hesitate to contact us again.</p>
                
                <p style="color: #333; margin-top: 20px;">
                    Best regards,<br>
                    <strong>SecureCrop Support Team</strong>
                </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    © 2025 SecureCrop - Secure Crop Recommendation System
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Hello {inq.name},

Thank you for reaching out to us. Here is our response to your inquiry:

Your Original Message: "{inq.subject}"

Our Response:
{reply_message}

If you have any further questions, please don't hesitate to contact us again.

Best regards,
SecureCrop Support Team
        """
        
        try:
            email = EmailMultiAlternatives(
                subject=f"Re: {inq.subject} - SecureCrop Support",
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[inq.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            # Update inquiry
            inq.admin_reply = reply_message
            inq.replied_by = request.user
            inq.replied_at = timezone.now()
            inq.status = 'resolved'
            inq.save()
            
            return Response({
                'message': f'Reply sent successfully to {inq.email}',
                'inquiry_id': inq.id
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminInquiryStatsView(APIView):
    """Admin view - get inquiry statistics"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Count
        from django.db.models.functions import TruncDate
        from datetime import timedelta
        
        total = ContactInquiry.objects.count()
        pending = ContactInquiry.objects.filter(status='pending').count()
        in_progress = ContactInquiry.objects.filter(status='in_progress').count()
        resolved = ContactInquiry.objects.filter(status='resolved').count()
        closed = ContactInquiry.objects.filter(status='closed').count()
        
        # Category breakdown
        by_category = ContactInquiry.objects.values('category').annotate(count=Count('id'))
        
        # Recent 7 days
        week_ago = timezone.now() - timedelta(days=7)
        recent_count = ContactInquiry.objects.filter(created_at__gte=week_ago).count()
        
        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'closed': closed,
            'by_category': list(by_category),
            'recent_7_days': recent_count,
        })
