#!/usr/bin/env bash
# exit on error
set -o errexit

# Navigate to project root
cd "$(dirname "$0")/.."

# Build Frontend (v1.0.1 - Fixed localhost URLs)
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Navigate back to backend
cd backend

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create superuser automatically if environment variables are set
if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Checking for superuser..."
    python manage.py shell << END
from accounts.models import User
import os

email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')

if email and password and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, username=username, password=password)
    print(f'Superuser {email} created successfully!')
else:
    print('Superuser already exists or credentials not provided.')
END
fi

echo "Build completed successfully!"
