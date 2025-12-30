"""
Weather API Views
Provides weather data using OpenWeatherMap API
"""
import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.conf import settings
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Reload .env to ensure latest values
load_dotenv()

# OpenWeatherMap API Key - use environment variable with fallback
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '90d15b7fdfc7a271fe97287339babf47')



class CurrentWeatherView(APIView):
    """Get current weather data"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        lat = request.query_params.get('lat', 3.1390)  # Default: Kuala Lumpur
        lon = request.query_params.get('lon', 101.6869)
        
        # Log API key status (first 10 chars only for security)
        api_key = OPENWEATHER_API_KEY
        print(f"Weather API Key: {api_key[:10]}... (length: {len(api_key)})")
        
        if not api_key or api_key == 'YOUR_API_KEY_HERE':
            return Response({
                'error': 'Weather API key not configured',
                'detail': 'Please set OPENWEATHER_API_KEY in environment variables'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': api_key,
                'units': 'metric'
            }
            
            print(f"Fetching weather for lat={lat}, lon={lon}")
            response = requests.get(url, params=params, timeout=10)
            
            print(f"Weather API response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                # Calculate rain probability - use rain % if available, else derive from clouds
                rain_prob = 0
                if 'rain' in data:
                    rain_prob = min(100, data['rain'].get('1h', 0) * 10)  # Rain amount to probability
                elif data['clouds']['all'] > 80:
                    rain_prob = 60  # High clouds = moderate rain chance
                elif data['clouds']['all'] > 50:
                    rain_prob = 30  # Moderate clouds
                else:
                    rain_prob = data['clouds']['all'] * 0.3  # Low clouds = low chance
                
                return Response({
                    'temperature': data['main']['temp'],
                    'feels_like': data['main']['feels_like'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'wind_speed': round(data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
                    'wind_direction': data['wind'].get('deg', 0),
                    'description': data['weather'][0]['description'],
                    'icon': data['weather'][0]['icon'],
                    'main': data['weather'][0]['main'],
                    'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
                    'clouds': data['clouds']['all'],
                    'rain_probability': round(rain_prob),  # Add rain probability
                    'rain_chance': round(rain_prob),  # Alias for dashboard compatibility
                    'sunrise': data['sys']['sunrise'],
                    'sunset': data['sys']['sunset'],
                    'city': data['name'],
                    'country': data['sys']['country'],
                    'timestamp': data['dt']
                })
            else:
                error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
                print(f"Weather API error: {response.status_code} - {error_data}")
                return Response({
                    'error': 'Failed to fetch weather data',
                    'status_code': response.status_code,
                    'detail': error_data.get('message', 'Unknown error')
                }, status=response.status_code)
        except requests.Timeout:
            print("Weather API timeout")
            return Response({'error': 'Weather service timeout'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            import traceback
            print(f"Weather API exception: {e}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForecastView(APIView):
    """Get weather forecast"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        lat = request.query_params.get('lat', 3.1390)
        lon = request.query_params.get('lon', 101.6869)
        days = int(request.query_params.get('days', 3))
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/forecast"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric',
                'cnt': days * 8  # 8 data points per day (every 3 hours)
            }
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                # Group by day
                daily_forecasts = {}
                for item in data['list']:
                    date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
                    if date not in daily_forecasts:
                        daily_forecasts[date] = {
                            'date': date,
                            'temperature_min': item['main']['temp_min'],
                            'temperature_max': item['main']['temp_max'],
                            'humidity': item['main']['humidity'],
                            'condition': item['weather'][0]['description'],
                            'condition_icon': item['weather'][0]['icon'],
                            'wind_speed': item['wind']['speed'],
                            'rain_probability': item.get('pop', 0) * 100  # Probability of precipitation
                        }
                    else:
                        daily_forecasts[date]['temperature_min'] = min(daily_forecasts[date]['temperature_min'], item['main']['temp_min'])
                        daily_forecasts[date]['temperature_max'] = max(daily_forecasts[date]['temperature_max'], item['main']['temp_max'])
                
                # Return forecasts directly as an array for the frontend
                return Response(list(daily_forecasts.values())[:days])

            else:
                return Response({'error': 'Failed to fetch forecast data'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AlertsView(APIView):
    """Get weather alerts for a location"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        lat = request.query_params.get('lat', 3.1390)
        lon = request.query_params.get('lon', 101.6869)
        
        try:
            # Use One Call API for alerts (requires subscription)
            # For now, generate alerts based on current weather
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            response = requests.get(url, params=params)
            
            alerts = []
            if response.status_code == 200:
                data = response.json()
                
                # Generate alerts based on conditions
                if data['main']['temp'] > 35:
                    alerts.append({
                        'type': 'heat_warning',
                        'severity': 'high',
                        'title': 'Heat Warning',
                        'description': f"High temperature of {data['main']['temp']}°C. Take precautions for crops and livestock.",
                        'icon': '🌡️'
                    })
                
                if data['main']['humidity'] > 85:
                    alerts.append({
                        'type': 'humidity_warning',
                        'severity': 'medium',
                        'title': 'High Humidity Alert',
                        'description': f"Humidity at {data['main']['humidity']}%. Risk of fungal diseases.",
                        'icon': '💧'
                    })
                
                if data['wind']['speed'] > 10:
                    alerts.append({
                        'type': 'wind_warning',
                        'severity': 'medium',
                        'title': 'Strong Wind Alert',
                        'description': f"Wind speeds of {data['wind']['speed']} m/s expected.",
                        'icon': '💨'
                    })
                
                if 'rain' in data.get('weather', [{}])[0].get('main', '').lower():
                    alerts.append({
                        'type': 'rain_alert',
                        'severity': 'low',
                        'title': 'Rain Expected',
                        'description': 'Rainfall expected. Plan irrigation and harvesting accordingly.',
                        'icon': '🌧️'
                    })
            
            return Response(alerts)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RiskScoreView(APIView):
    """Calculate climate risk score"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        lat = request.query_params.get('lat', 3.1390)
        lon = request.query_params.get('lon', 101.6869)
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Calculate risk score based on weather conditions
                risk_score = 0
                risk_factors = []
                
                # Temperature risk
                temp = data['main']['temp']
                if temp > 35 or temp < 10:
                    risk_score += 30
                    risk_factors.append('Extreme temperature')
                elif temp > 32 or temp < 15:
                    risk_score += 15
                    risk_factors.append('Moderate temperature stress')
                
                # Humidity risk
                humidity = data['main']['humidity']
                if humidity > 90 or humidity < 30:
                    risk_score += 25
                    risk_factors.append('Extreme humidity')
                elif humidity > 80 or humidity < 40:
                    risk_score += 10
                    risk_factors.append('Moderate humidity concern')
                
                # Wind risk
                wind = data['wind']['speed']
                if wind > 15:
                    risk_score += 25
                    risk_factors.append('High wind speed')
                elif wind > 10:
                    risk_score += 10
                    risk_factors.append('Moderate wind')
                
                # Determine risk level
                if risk_score >= 60:
                    level = 'high'
                elif risk_score >= 30:
                    level = 'medium'
                else:
                    level = 'low'
                
                return Response({
                    'score': min(risk_score, 100),
                    'level': level,
                    'factors': risk_factors,
                    'recommendations': self._get_recommendations(level, risk_factors)
                })
            else:
                return Response({'score': 0, 'level': 'unknown', 'factors': []})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_recommendations(self, level, factors):
        recommendations = []
        if 'Extreme temperature' in factors or 'Moderate temperature stress' in factors:
            recommendations.append('Consider irrigation during cooler hours')
            recommendations.append('Provide shade for sensitive crops')
        if 'Extreme humidity' in factors or 'Moderate humidity concern' in factors:
            recommendations.append('Monitor for fungal diseases')
            recommendations.append('Ensure proper ventilation')
        if 'High wind speed' in factors or 'Moderate wind' in factors:
            recommendations.append('Stake tall plants')
            recommendations.append('Delay spraying operations')
        return recommendations


class InsightsView(APIView):
    """Get agricultural insights based on weather"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop = request.query_params.get('crop', 'general')
        lat = request.query_params.get('lat', 3.1390)
        lon = request.query_params.get('lon', 101.6869)
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            response = requests.get(url, params=params)
            
            insights = []
            if response.status_code == 200:
                data = response.json()
                temp = data['main']['temp']
                humidity = data['main']['humidity']
                
                # General farming insights
                insights.append({
                    'category': 'irrigation',
                    'title': 'Irrigation Recommendation',
                    'description': f"With current humidity at {humidity}%, {'reduce watering' if humidity > 70 else 'maintain regular watering schedule'}.",
                    'priority': 'low' if humidity > 70 else 'medium'
                })
                
                insights.append({
                    'category': 'pest_control',
                    'title': 'Pest & Disease Alert',
                    'description': f"Current conditions {'favor fungal growth. Monitor closely.' if humidity > 80 else 'are moderate for pest activity.'}",
                    'priority': 'high' if humidity > 80 else 'low'
                })
                
                insights.append({
                    'category': 'planting',
                    'title': 'Planting Conditions',
                    'description': f"Temperature of {temp}°C is {'optimal' if 20 <= temp <= 30 else 'suboptimal'} for most crops.",
                    'priority': 'medium'
                })
                
                insights.append({
                    'category': 'harvest',
                    'title': 'Harvest Timing',
                    'description': "Best to harvest in early morning when moisture levels are optimal.",
                    'priority': 'low'
                })
            
            return Response(insights)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HistoryView(APIView):
    """Get weather history (simulated for demo)"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        days = int(request.query_params.get('days', 7))
        
        # Generate simulated history data
        history = []
        for i in range(days, 0, -1):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            history.append({
                'date': date,
                'temp_avg': 28 + (i % 5),
                'temp_min': 24 + (i % 3),
                'temp_max': 32 + (i % 4),
                'humidity': 70 + (i % 10),
                'rainfall': (i * 2) % 15
            })
        
        return Response(history)


class LocationView(APIView):
    """Get or update user's saved location"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'city': getattr(user, 'city', 'Kuala Lumpur'),
            'state': getattr(user, 'state', 'Selangor'),
            'latitude': getattr(user, 'latitude', 3.1390),
            'longitude': getattr(user, 'longitude', 101.6869),
        })
    
    def post(self, request):
        user = request.user
        user.city = request.data.get('city', user.city)
        user.state = request.data.get('state', user.state)
        user.latitude = request.data.get('latitude', user.latitude)
        user.longitude = request.data.get('longitude', user.longitude)
        user.save()
        
        return Response({
            'message': 'Location updated successfully',
            'city': user.city,
            'state': user.state,
            'latitude': user.latitude,
            'longitude': user.longitude,
        })
