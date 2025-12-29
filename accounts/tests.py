from django.test import TestCase
from .models import User


class UserModelTest(TestCase):
    """Test cases for User model."""
    
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'testpass123'
        }
    
    def test_create_user(self):
        """Test creating a regular user."""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.role, 'USER')
        self.assertTrue(user.check_password(self.user_data['password']))
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        admin = User.objects.create_superuser(**self.user_data)
        self.assertEqual(admin.role, 'ADMIN')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
