"""
Views for user authentication and account management.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, RegisterSerializer


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
