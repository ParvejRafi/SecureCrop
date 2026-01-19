"""
Views for user authentication and account management.
"""
import os
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import User, PasswordResetToken
from .permissions import IsAdminUser
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    
    POST /api/auth/register/
    - Creates a new user account with USER role
    - Requires: email, username, password, password_confirm
    - Returns: user data and JWT tokens
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    API endpoint for user login.
    
    POST /api/auth/login/
    - Authenticates user with email and password
    - Returns: user data and JWT tokens
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        
        if not email or not password:
            return Response({
                'error': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class CurrentUserView(generics.RetrieveAPIView):
    """
    API endpoint to get current authenticated user details.
    
    GET /api/auth/me/
    - Returns: current user data
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class ProfileView(APIView):
    """
    API endpoint to get and update user profile.
    
    GET /api/auth/profile/
    - Returns: current user profile data
    
    PUT /api/auth/profile/
    - Updates user profile
    - Returns: updated user data
    """
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        profile_picture_url = None
        if hasattr(user, 'profile_picture') and user.profile_picture:
            profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user.role,
                'phone_number': getattr(user, 'phone_number', '') or '',
                'location_lat': getattr(user, 'location_lat', None),
                'location_lon': getattr(user, 'location_lon', None),
                'receive_email_alerts': getattr(user, 'receive_email_alerts', False),
                'receive_sms_alerts': getattr(user, 'receive_sms_alerts', False),
                'profile_picture': profile_picture_url,
                'date_joined': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
            }
        })

    
    def put(self, request):
        user = request.user
        data = request.data
        
        # Update allowed fields
        if 'username' in data:
            user.username = data['username']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'location_lat' in data:
            user.location_lat = data['location_lat']
        if 'location_lon' in data:
            user.location_lon = data['location_lon']
        if 'receive_email_alerts' in data:
            user.receive_email_alerts = data['receive_email_alerts']
        if 'receive_sms_alerts' in data:
            user.receive_sms_alerts = data['receive_sms_alerts']
        
        user.save()
        
        profile_picture_url = None
        if hasattr(user, 'profile_picture') and user.profile_picture:
            profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user.role,
                'phone_number': getattr(user, 'phone_number', ''),
                'location_lat': getattr(user, 'location_lat', None),
                'location_lon': getattr(user, 'location_lon', None),
                'receive_email_alerts': getattr(user, 'receive_email_alerts', False),
                'receive_sms_alerts': getattr(user, 'receive_sms_alerts', False),
                'profile_picture': profile_picture_url,
            },
            'message': 'Profile updated successfully'
        })


class ProfilePictureUploadView(APIView):
    """
    API endpoint to upload profile picture.
    
    POST /api/auth/profile/picture/
    - Uploads a new profile picture
    - Accepts: multipart/form-data with 'picture' file
    - Returns: updated profile picture URL
    """
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        user = request.user
        
        if 'picture' not in request.FILES:
            return Response({
                'error': 'No picture file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        picture = request.FILES['picture']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if picture.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB)
        if picture.size > 5 * 1024 * 1024:
            return Response({
                'error': 'File too large. Maximum size is 5MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old profile picture if exists
        if user.profile_picture:
            user.profile_picture.delete(save=False)
        
        # Save new profile picture
        user.profile_picture = picture
        user.save()
        
        profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
        
        return Response({
            'message': 'Profile picture uploaded successfully',
            'profile_picture': profile_picture_url
        })
    
    def delete(self, request):
        user = request.user
        
        if user.profile_picture:
            user.profile_picture.delete(save=True)
            return Response({
                'message': 'Profile picture removed successfully'
            })
        
        return Response({
            'error': 'No profile picture to remove'
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    API endpoint for requesting password reset.
    
    POST /api/auth/password-reset/
    - Sends password reset email with token link
    - Requires: email
    - Returns: success message
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        try:
            serializer = PasswordResetRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email, is_active=True)
                
                # Invalidate old tokens for this user
                PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
                
                # Create new reset token
                reset_token = PasswordResetToken.create_token(user)
                
                # Build reset link
                frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
                reset_link = f"{frontend_url}/reset-password?token={reset_token.token}"
                
                # Save reset link to database (for admin viewing)
                reset_token.reset_link = reset_link
                reset_token.save()
                
                # Send password reset email using Brevo API (HTTP - works on Render free tier)
                email_sent = False
                error_message = None
                
                try:
                    import requests
                    
                    # Use Brevo API instead of SMTP (Render blocks SMTP ports on free tier)
                    brevo_api_key = os.getenv('BREVO_API_KEY')
                    
                    if not brevo_api_key:
                        raise ValueError("BREVO_API_KEY not configured")
                    
                    html_content = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                            .button {{ display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }}
                            .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                            .link {{ color: #10b981; word-break: break-all; }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔒 Password Reset Request</h1>
                            </div>
                            <div class="content">
                                <h2>Hello {user.username},</h2>
                                <p>You have requested to reset your password for your SecureCrop account.</p>
                                <p>Click the button below to reset your password:</p>
                                <p style="text-align: center;">
                                    <a href="{reset_link}" class="button">Reset Your Password</a>
                                </p>
                                <p>Or copy and paste this link into your browser:</p>
                                <p class="link">{reset_link}</p>
                                <p><strong>⏰ This link will expire in 1 hour.</strong></p>
                                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                            </div>
                            <div class="footer">
                                <p>Best regards,<br><strong>SecureCrop Team</strong></p>
                                <p>🌾 Empowering Farmers with AI-Powered Agriculture</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    
                    # Send via Brevo HTTP API
                    response = requests.post(
                        'https://api.brevo.com/v3/smtp/email',
                        headers={
                            'accept': 'application/json',
                            'api-key': brevo_api_key,
                            'content-type': 'application/json'
                        },
                        json={
                            'sender': {
                                'name': 'SecureCrop',
                                'email': 'mdparvej.ahmedrafi@student.aiu.edu.my'
                            },
                            'to': [{'email': user.email, 'name': user.username}],
                            'subject': 'Password Reset Request - SecureCrop',
                            'htmlContent': html_content
                        },
                        timeout=10
                    )
                    
                    if response.status_code in [200, 201]:
                        email_sent = True
                        print(f"✅ Password reset email sent via Brevo API to {user.email}")
                    else:
                        raise Exception(f"Brevo API returned status {response.status_code}: {response.text}")
                    
                except Exception as e:
                    error_message = str(e)
                    print(f"❌ Error sending password reset email to {user.email}: {error_message}")
                    import traceback
                    traceback.print_exc()
                    
                    # In development or if email fails, print the reset link
                    if settings.DEBUG:
                        print(f"🔗 Password reset link: {reset_link}")
                
                # Always return success to prevent email enumeration
                # But include debug info in development
                response_data = {
                    'message': 'If your email is registered, you will receive a password reset link shortly.',
                }
                
                # Add debug info in development
                if settings.DEBUG:
                    response_data['debug_link'] = reset_link
                    response_data['email_sent'] = email_sent
                    if error_message:
                        response_data['email_error'] = error_message
                
                return Response(response_data, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Return same message to prevent email enumeration
                return Response({
                    'message': 'If your email is registered, you will receive a password reset link shortly.'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            # Catch any unexpected errors and log them
            print(f"❌❌❌ CRITICAL ERROR in password reset: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'An error occurred. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    """
    API endpoint for confirming password reset with token.
    
    POST /api/auth/password-reset/confirm/
    - Resets password using valid token
    - Requires: token, new_password, new_password_confirm
    - Returns: success message
    """
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_string = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            # Get the reset token
            reset_token = PasswordResetToken.objects.get(token=token_string)
            
            # Check if token is valid
            if not reset_token.is_valid():
                return Response({
                    'error': 'Invalid or expired reset token. Please request a new password reset.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset the password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.used = True
            reset_token.save()
            
            # Invalidate other tokens for this user
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            
            return Response({
                'message': 'Password reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Invalid reset token. Please request a new password reset.'
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetVerifyTokenView(APIView):
    """
    API endpoint for verifying password reset token validity.
    
    GET /api/auth/password-reset/verify/?token=xxx
    - Checks if token is valid and not expired
    - Returns: token validity status
    """
    permission_classes = (AllowAny,)
    
    def get(self, request):
        token_string = request.query_params.get('token')
        
        if not token_string:
            return Response({
                'error': 'Token parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token_string)
            
            if reset_token.is_valid():
                return Response({
                    'valid': True,
                    'email': reset_token.user.email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'Token has expired or been used'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(APIView):
    """
    API endpoint for admin to get all users.
    
    GET /api/auth/admin/users/
    - Returns: list of all users with their details
    """
    permission_classes = (IsAuthenticated, IsAdminUser)
    
    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at,
                'last_login': user.last_login,
                'phone_number': user.phone_number,
                'location_lat': user.location_lat,
                'location_lon': user.location_lon,
                'receive_email_alerts': user.receive_email_alerts,
                'receive_sms_alerts': user.receive_sms_alerts,
            })
        
        return Response({
            'count': users.count(),
            'results': users_data
        }, status=status.HTTP_200_OK)


