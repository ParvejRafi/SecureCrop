# SecureCrop - AI-Powered Crop Recommendation System with Cybersecurity

SecureCrop is a production-ready web application that provides intelligent crop recommendations based on soil parameters while ensuring data integrity through advanced cybersecurity measures and explainable AI.

## Features

### 🌾 Core Functionality
- **ML-Based Crop Recommendations**: Multi-model machine learning (RandomForest, SVC, KNN, GaussianNB) predicts optimal crops
- **Soil Analysis**: Input N, P, K, pH, moisture, and temperature values with comprehensive validation
- **Explainable AI**: SHAP-based explanations for model predictions with natural language summaries
- **Historical Tracking**: Complete analysis history with detailed recommendation records

### ☁️ Weather & Climate Intelligence
- **Real-Time Weather Data**: Live weather conditions with temperature, humidity, wind speed
- **7-Day Forecasts**: Detailed weather predictions for farming planning
- **Weather Alerts**: Automated notifications for extreme conditions (storms, frost, heat waves)
- **Risk Assessment**: AI-powered risk scoring for crop protection
- **Email Notifications**: Daily weather updates with farmer-centric recommendations
- **Location-Based**: GPS integration with persistent location storage

### 🗺️ Market Linkage & Intelligence **NEW**
- **Nearby Markets Discovery**: Find agricultural markets within 5-50km radius using GPS
- **Crop Buyers Directory**: Connect with verified buyers and collection centers
- **Agro Supply Stores**: Locate seed shops, fertilizer stores, equipment dealers
- **Google Maps Integration**: Interactive maps with color-coded markers and navigation
- **Custom Search**: Find specific services ("fertilizer shop", "FAMA center")
- **Real-Time Data**: Google Places API integration with ratings, hours, contact info
- **One-Click Navigation**: Direct Google Maps directions to any location
- **Buyer Registration**: Farmers can register as buyers with verification system
- **Favorites System**: Save frequently visited markets and suppliers

### 🔒 Cybersecurity Layer
- **Anomaly Detection**: IsolationForest algorithm identifies suspicious soil data patterns
- **Data Integrity**: SHA-256 hashing ensures data hasn't been tampered with
- **Pre & Post-ML Validation**: Dual-layer security checks before and after predictions
- **Comprehensive Logging**: All security events tracked in CyberLog and AdminLog tables

### 👥 User Management
- **Role-Based Access Control (RBAC)**: Separate USER and ADMIN roles
- **Email-Based Authentication**: JWT tokens with access/refresh mechanism
- **User Dashboard**: Personal statistics and recent analysis history
- **Admin Dashboard**: System-wide monitoring and management

### 📊 Admin Features
- User management with activity tracking
- Soil input oversight across all users
- Cybersecurity event monitoring with filtering
- Admin action logging for audit trails
- Real-time statistics and system status

## Technology Stack

### Backend
- **Framework**: Django 4.2.7 with Django REST Framework 3.14.0
- **Database**: PostgreSQL / SQLite
- **Authentication**: Simple JWT 5.3.0
- **ML Stack**: 
  - scikit-learn 1.3.2 (RandomForest, SVC, KNN, GaussianNB)
  - pandas 2.1.3, numpy 1.26.2
  - SHAP 0.44.0 (Explainable AI)
  - joblib 1.3.2 (Model persistence)
- **Security**: IsolationForest (anomaly detection), cryptography 41.0.7
- **Weather API**: OpenWeatherMap API
- **Maps & Places**: Google Places API, Google Maps JavaScript API

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6 with custom agriculture theme
- **Routing**: React Router 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Icons**: Lucide React 0.294.0
- **Maps**: @react-google-maps/api (Google Maps integration)

## Project Structure

```
SecuredCropSystem/
├── backend/
│   ├── accounts/          # User authentication & authorization
│   ├── soil/              # Soil input data management
│   ├── ml_engine/         # Machine learning models & training
│   ├── cyber_layer/       # Security checks & anomaly detection
│   ├── explainable_ai/    # SHAP-based model explanations
│   ├── recommendations/   # Crop recommendation storage
│   ├── feedback/          # User feedback system
│   ├── logs/              # Admin & cyber logging
│   ├── securecrop/        # Django project settings
│   ├── requirements.txt   # Python dependencies
│   └── manage.py          # Django management script
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── contexts/      # React contexts (Auth)
    │   ├── pages/         # Page components
    │   │   ├── user/      # User-facing pages
    │   │   └── admin/     # Admin-only pages
    │   ├── services/      # API integration layer
    │   └── types/         # TypeScript type definitions
    ├── package.json       # npm dependencies
    └── vite.config.ts     # Vite configuration
```

## Installation & Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Create Python virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Python dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Create PostgreSQL database**
   ```powershell
   # Using psql
   psql -U postgres
   CREATE DATABASE securecrop_db;
   CREATE USER securecrop_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE securecrop_db TO securecrop_user;
   \q
   ```

5. **Create environment variables file**
   ```powershell
   # Create .env file in backend/ directory
   New-Item -Path .env -ItemType File
   ```

   Add the following to `.env`:
   ```env
   SECRET_KEY=your-secret-key-here-generate-with-django
   DEBUG=True
   
   DB_NAME=securecrop_db
   DB_USER=securecrop_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

6. **Run database migrations**
   ```powershell
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser (Admin account)**
   ```powershell
   python manage.py createsuperuser
   # Enter email, username, and password when prompted
   ```

8. **Train the ML model**
   ```powershell
   python ml_engine/train_model.py
   ```
   This will:
   - Generate synthetic training data for 10 crops
   - Train 4 ML algorithms (RandomForest, SVC, KNN, GaussianNB)
   - Select the best model based on accuracy
   - Save model to `ml_engine/models/best_model.joblib`
   - Create ModelRegistry entry in database

9. **Start Django development server**
   ```powershell
   python manage.py runserver
   ```
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Open new terminal and navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install npm dependencies**
   ```powershell
   npm install
   ```

3. **Start Vite development server**
   ```powershell
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Initial Testing

1. **Register a new user account**
   - Navigate to `http://localhost:5173/register`
   - Enter email, username, and password
   - User will be created with role 'USER' by default

2. **Login as user**
   - Navigate to `http://localhost:5173/login`
   - Enter credentials
   - You'll be redirected to user dashboard

3. **Submit soil analysis**
   - Go to "Soil Input" page
   - Enter soil parameters:
     - N, P, K: 0-200 mg/kg
     - pH: 0-14
     - Moisture: 0-100%
     - Temperature: -10 to 60°C
   - Submit and view crop recommendation with security checks

4. **Login as admin**
   - Use superuser credentials created earlier
   - You'll be redirected to admin dashboard
   - Access to all admin features (user management, logs, etc.)

## API Endpoints

### Authentication
```
POST   /api/accounts/register/           # User registration
POST   /api/accounts/login/              # User login
GET    /api/accounts/current-user/       # Get current user info
POST   /api/token/refresh/               # Refresh JWT token
```

### Soil Analysis
```
POST   /api/soil/soil-input/             # Submit soil analysis (User)
GET    /api/soil/soil-input/             # Get user's soil inputs (User)
```

### Recommendations
```
GET    /api/recommendations/             # Get user's recommendations (User)
GET    /api/recommendations/{id}/        # Get specific recommendation (User)
```

### Feedback
```
POST   /api/feedback/                    # Submit feedback (User)
GET    /api/feedback/                    # Get user's feedback (User)
GET    /api/feedback/stats/              # Get feedback statistics (Admin)
```

### Admin
```
GET    /api/admin/users/                 # Get all users (Admin)
GET    /api/admin/soil-inputs/           # Get all soil inputs (Admin)
GET    /api/admin/cyber-logs/            # Get cyber logs (Admin)
GET    /api/admin/cyber-logs/stats/      # Get cyber statistics (Admin)
GET    /api/admin/admin-logs/            # Get admin logs (Admin)
```

## Security Features

### Input Validation
- **Range Validation**: All soil parameters validated against scientifically valid ranges
- **Type Checking**: Strong type validation on frontend (TypeScript) and backend (DRF serializers)
- **SQL Injection Prevention**: Django ORM prevents SQL injection attacks
- **XSS Protection**: React automatically escapes output

### Anomaly Detection
- **IsolationForest Algorithm**: Detects outliers in soil data patterns
- **Contamination Rate**: Set to 10% (configurable in `cyber_layer/services.py`)
- **Pre-ML Validation**: Checks data before feeding to ML model
- **Logging**: All anomalies logged with timestamps and details

### Data Integrity
- **SHA-256 Hashing**: Each soil input gets unique hash for integrity verification
- **Tamper Detection**: Changes to data can be detected via hash comparison
- **Audit Trail**: Complete log of all data modifications

### Authentication Security
- **JWT Tokens**: Stateless authentication with short-lived access tokens (60 min)
- **Refresh Tokens**: Long-lived refresh tokens (7 days) for seamless re-authentication
- **Password Hashing**: Django's PBKDF2 algorithm with SHA256
- **CORS Protection**: Configured for localhost development

## ML Model Details

### Supported Crops
1. Rice
2. Wheat
3. Corn
4. Cotton
5. Sugarcane
6. Potato
7. Tomato
8. Soybean
9. Barley
10. Millet

### Training Process
- **Dataset**: Synthetic data generation with realistic parameter ranges per crop
- **Samples**: 150 samples per crop (1500 total)
- **Features**: N, P, K, pH, moisture, temperature (6 features)
- **Algorithms**: RandomForest, SVC, KNN, GaussianNB
- **Selection**: Best model chosen by cross-validation accuracy
- **Preprocessing**: StandardScaler for feature normalization

### Model Performance
- Typical accuracy: 85-95% (depends on random data generation)
- Confidence threshold: 0.5 (predictions below this are flagged)
- Real-time predictions: < 100ms per inference

## Explainable AI

### SHAP Integration
- **TreeExplainer**: For tree-based models (RandomForest)
- **KernelExplainer**: For non-tree models (SVC, KNN, GaussianNB)
- **Feature Importance**: Top 3 most influential features identified
- **Natural Language**: Human-readable explanations generated

### Explanation Format
Example: "This recommendation is based on: High Nitrogen content (78.5), Moderate Phosphorus levels (45.2), and Optimal pH balance (6.8). Your soil shows: NPK levels are well-balanced, pH is slightly acidic (ideal for crops like rice), Moisture content is adequate."

## Color Scheme

The application uses a professional agriculture-themed color palette:

- **Primary (Green)**: `#22c55e` family - Represents growth and agriculture
- **Secondary (Yellow)**: `#eab308` family - Represents harvest and sunshine
- **Neutral (Gray)**: For text and backgrounds
- **Status Colors**:
  - Success: Green (`#10b981`)
  - Warning: Yellow (`#f59e0b`)
  - Error: Red (`#ef4444`)
  - Info: Blue (`#3b82f6`)

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=           # Django secret key
DEBUG=                # True/False
DB_NAME=              # PostgreSQL database name
DB_USER=              # PostgreSQL username
DB_PASSWORD=          # PostgreSQL password
DB_HOST=              # Database host (localhost)
DB_PORT=              # Database port (5432)
```

## Troubleshooting

### Backend Issues

**Database connection error**
- Verify PostgreSQL is running: `Get-Service -Name postgresql*`
- Check credentials in `.env` file
- Ensure database exists: `psql -U postgres -l`

**ML model not found**
- Run training script: `python ml_engine/train_model.py`
- Check `ml_engine/models/` directory exists

**Migration errors**
- Delete migrations: `Get-ChildItem -Path */migrations/*.py -Exclude __init__.py | Remove-Item`
- Recreate: `python manage.py makemigrations`
- Apply: `python manage.py migrate`

### Frontend Issues

**npm install errors**
- Clear cache: `npm cache clean --force`
- Delete node_modules: `Remove-Item -Recurse -Force node_modules`
- Reinstall: `npm install`

**API connection errors**
- Verify backend is running on port 8000
- Check CORS settings in `backend/securecrop/settings.py`
- Verify proxy in `frontend/vite.config.ts`

**TypeScript errors**
- Run type check: `npm run build`
- Check `tsconfig.json` configuration

## Production Deployment

### Backend
1. Set `DEBUG=False` in `.env`
2. Generate strong `SECRET_KEY`
3. Configure allowed hosts in `settings.py`
4. Use production database (PostgreSQL on cloud)
5. Set up static file serving (WhiteNoise or CDN)
6. Use Gunicorn/uWSGI as WSGI server
7. Configure HTTPS/SSL certificates
8. Set up monitoring (Sentry, New Relic)

### Frontend
1. Build production bundle: `npm run build`
2. Serve `dist/` folder via Nginx/Apache
3. Update API URLs to production backend
4. Configure environment-specific variables
5. Enable CDN for static assets
6. Set up analytics (Google Analytics, Mixpanel)

## Contributing

This is a final-year project. For educational purposes only.

## License

Educational project - All rights reserved.

## Contact

For questions or support regarding this project, please contact the development team.

---

**Built with ❤️ using Django, React, and Machine Learning**
