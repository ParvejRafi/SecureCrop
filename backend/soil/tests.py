from django.test import TestCase
from accounts.models import User
from .models import SoilInput


class SoilInputModelTest(TestCase):
    """Test cases for SoilInput model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
    
    def test_create_soil_input(self):
        """Test creating a soil input."""
        soil_input = SoilInput.objects.create(
            user=self.user,
            N_level=50.0,
            P_level=30.0,
            K_level=40.0,
            ph=6.5,
            moisture=60.0,
            temperature=25.0
        )
        self.assertEqual(soil_input.user, self.user)
        self.assertEqual(soil_input.N_level, 50.0)
    
    def test_to_feature_array(self):
        """Test feature array conversion."""
        soil_input = SoilInput.objects.create(
            user=self.user,
            N_level=50.0,
            P_level=30.0,
            K_level=40.0,
            ph=6.5,
            moisture=60.0,
            temperature=25.0
        )
        features = soil_input.to_feature_array()
        self.assertEqual(len(features), 6)
        self.assertEqual(features[0], 50.0)
