# SecureCrop Setup Script for Windows PowerShell
# This script automates the initial setup process

Write-Host "========================================" -ForegroundColor Green
Write-Host "   SecureCrop Setup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.10 or higher." -ForegroundColor Red
    exit 1
}

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18.x or higher." -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    Write-Host "✓ Found PostgreSQL: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL not found in PATH. Make sure it's installed." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Backend Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Backend setup
Set-Location backend

Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv venv
Write-Host "✓ Virtual environment created" -ForegroundColor Green

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
SECRET_KEY=django-insecure-change-this-in-production-$(Get-Random)
DEBUG=True

DB_NAME=securecrop_db
DB_USER=securecrop_user
DB_PASSWORD=securecrop_pass
DB_HOST=localhost
DB_PORT=5432
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "✓ .env file created (please update database credentials)" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   DATABASE SETUP REQUIRED" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Before continuing, please create the PostgreSQL database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Open PostgreSQL command line (psql)" -ForegroundColor Cyan
Write-Host "     psql -U postgres" -ForegroundColor White
Write-Host ""
Write-Host "  2. Run these SQL commands:" -ForegroundColor Cyan
Write-Host "     CREATE DATABASE securecrop_db;" -ForegroundColor White
Write-Host "     CREATE USER securecrop_user WITH PASSWORD 'securecrop_pass';" -ForegroundColor White
Write-Host "     GRANT ALL PRIVILEGES ON DATABASE securecrop_db TO securecrop_user;" -ForegroundColor White
Write-Host "     \q" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you created the database? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Please create the database and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate
Write-Host "✓ Database migrations completed" -ForegroundColor Green

Write-Host ""
Write-Host "Creating superuser account..." -ForegroundColor Yellow
Write-Host "Please enter admin credentials:" -ForegroundColor Cyan
python manage.py createsuperuser

Write-Host ""
Write-Host "Training ML model..." -ForegroundColor Yellow
python ml_engine/train_model.py
Write-Host "✓ ML model trained and saved" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Frontend Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Set-Location frontend

Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ npm dependencies installed" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python manage.py runserver" -ForegroundColor White
Write-Host "  (runs on http://localhost:8000)" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  (runs on http://localhost:5173)" -ForegroundColor Gray
Write-Host ""
Write-Host "Access the application at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
