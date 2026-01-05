"""
Management command to reset admin password using environment variables.
Usage: python manage.py reset_admin_password
"""
import os
from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Reset admin password from DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD environment variables'

    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        
        if not email or not password:
            self.stdout.write(self.style.ERROR(
                'Environment variables DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD must be set'
            ))
            return
        
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.role = 'ADMIN'
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f'Successfully reset password for {email}'
            ))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(
                f'User with email {email} does not exist'
            ))
