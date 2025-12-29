"""
WSGI config for securecrop project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'securecrop.settings')

application = get_wsgi_application()
