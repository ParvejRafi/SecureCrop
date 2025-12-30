"""
Views for soil input management and crop recommendation processing.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SoilInput
from .serializers import SoilInputSerializer
from accounts.permissions import IsAdminUser
from cyber_layer.services import pre_ml_checks
from recommendations.services import create_recommendation_for_input
from explainable_ai.services import generate_ai_farming_guide


class SoilInputCreateView(generics.CreateAPIView):
    """
    API endpoint for creating soil input and getting crop recommendation.
    
    POST /api/soil-inputs/
    - Validates soil parameters
    - Runs cybersecurity checks (anomaly detection, integrity validation)
    - Generates crop recommendation with XAI explanation
    - Generates AI-powered farming guide using Gemini
    - Returns: soil input + recommendation + explanation + farming guide
    """
    serializer_class = SoilInputSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Validate input data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Prepare soil data for cyber checks
        soil_data = {
            'N_level': serializer.validated_data['N_level'],
            'P_level': serializer.validated_data['P_level'],
            'K_level': serializer.validated_data['K_level'],
            'ph': serializer.validated_data['ph'],
            'moisture': serializer.validated_data['moisture'],
            'temperature': serializer.validated_data['temperature'],
        }
        
        # Run pre-ML cybersecurity checks
        try:
            cyber_result = pre_ml_checks(soil_data, request.user)
        except Exception as e:
            import traceback
            print(f"Cyber check error: {e}")
            print(traceback.format_exc())
            return Response({
                'error': 'Security validation failed',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # If severe anomaly detected, return warning but continue
        if cyber_result.get('anomaly_detected') and cyber_result.get('integrity_status') == 'OUT_OF_RANGE':
            return Response({
                'error': 'Input data failed security checks',
                'detail': cyber_result.get('details', 'Data appears suspicious or out of normal range')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save soil input with integrity hash
        soil_input = serializer.save(
            user=request.user,
            integrity_hash=cyber_result.get('integrity_hash')
        )
        
        # Generate crop recommendation
        try:
            recommendation = create_recommendation_for_input(soil_input)
        except Exception as e:
            import traceback
            print(f"Recommendation error: {e}")
            print(traceback.format_exc())
            return Response({
                'error': 'Failed to generate recommendation',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Generate AI-powered farming guide
        try:
            farming_guide = generate_ai_farming_guide(recommendation.crop_name, soil_input)
        except Exception as e:
            print(f"AI farming guide error: {e}")
            farming_guide = None
        
        # Return complete response
        return Response({
            'soil_input': SoilInputSerializer(soil_input).data,
            'recommendation': {
                'id': recommendation.id,
                'crop_name': recommendation.crop_name,
                'explanation': recommendation.explanation,
                'created_at': recommendation.created_at
            },
            'farming_guide': farming_guide,
            'security_check': {
                'anomaly_detected': cyber_result.get('anomaly_detected', False),
                'integrity_status': cyber_result.get('integrity_status', 'OK')
            },
            'message': 'Crop recommendation generated successfully'
        }, status=status.HTTP_201_CREATED)


class SoilInputListView(generics.ListAPIView):
    """
    API endpoint to list soil inputs.
    
    GET /api/soil-inputs/
    - Regular users see only their own inputs
    - Admins see all inputs
    """
    serializer_class = SoilInputSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return SoilInput.objects.all()
        return SoilInput.objects.filter(user=user)


class SoilInputDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a specific soil input.
    
    GET /api/soil-inputs/<id>/
    """
    serializer_class = SoilInputSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return SoilInput.objects.all()
        return SoilInput.objects.filter(user=user)


class AdminSoilInputListView(generics.ListAPIView):
    """
    Admin-only endpoint to view all soil inputs with detailed information.
    
    GET /api/soil-inputs/admin/all/
    """
    serializer_class = SoilInputSerializer
    permission_classes = [IsAdminUser]
    queryset = SoilInput.objects.all()
