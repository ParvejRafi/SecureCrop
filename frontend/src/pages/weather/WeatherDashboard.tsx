/**
 * Weather Dashboard Page
 * Main page for Weather & Climate Intelligence feature
 * Uses live location by default, with option to check other states
 */
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { StateSelector } from '../../components/StateSelector';
import { WeatherAlertCard } from '../../components/weather/WeatherAlertCard';
import { WeatherStatCard } from '../../components/weather/WeatherStatCard';
import { ClimateRiskCard } from '../../components/weather/ClimateRiskCard';
import { ForecastCard } from '../../components/weather/ForecastCard';
import { weatherAPI } from '../../services/weatherAPI';
import { MapPin, RefreshCw, Navigation, Globe, Bell, Mail, MessageSquare } from 'lucide-react';
import axios from 'axios';

export const WeatherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; city?: string; state?: string } | null>(null);
  const [viewingLocation, setViewingLocation] = useState<{ lat: number; lon: number; city: string; state: string; isLive: boolean } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'denied'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    // Load user profile and check for saved location
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (currentWeather) {
      loadInsights();
    }
  }, [selectedCrop]);

  // Request user's real-time location via browser geolocation API
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationStatus('denied');
      loadWeatherData(); // Load default weather
      return;
    }

    setLocationStatus('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city and state name
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=90d15b7fdfc7a271fe97287339babf47`
          );
          const data = await response.json();
          const city = data[0]?.name || 'Your Location';
          const state = data[0]?.state || '';

          setUserLocation({ lat: latitude, lon: longitude, city, state });
          setViewingLocation({ lat: latitude, lon: longitude, city, state, isLive: true });

          // Save location to user profile
          await saveLocationToProfile(latitude, longitude);
        } catch (error) {
          setUserLocation({ lat: latitude, lon: longitude });
          setViewingLocation({ lat: latitude, lon: longitude, city: 'Your Location', state: '', isLive: true });

          // Still try to save location even if geocoding fails
          await saveLocationToProfile(latitude, longitude);
        }

        setLocationStatus('success');
        loadWeatherData(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setLocationError(errorMessage);
        setLocationStatus('denied');
        loadWeatherData(); // Load default weather for Kuala Lumpur
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  // Save location to user profile
  const saveLocationToProfile = async (lat: number, lon: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return; // User not logged in

      const updatedProfile = {
        ...userProfile,
        location_lat: lat,
        location_lon: lon,
      };

      await axios.put(
        'http://127.0.0.1:8000/api/auth/profile/',
        updatedProfile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserProfile(updatedProfile);
      console.log('Location saved to profile successfully');
    } catch (error) {
      console.error('Error saving location to profile:', error);
      // Don't show error to user - location still works for this session
    }
  };

  const loadWeatherData = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);

      // Load all weather data in parallel with location if provided
      const [weatherData, forecastData, alertsData, riskData, insightsData] = await Promise.all([
        weatherAPI.getCurrentWeather(lat, lon),
        weatherAPI.getForecast(lat, lon),
        weatherAPI.getAlerts(lat, lon),
        weatherAPI.getRiskScore(lat, lon),
        weatherAPI.getInsights(selectedCrop, lat, lon),
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setAlerts(alertsData);
      setRiskScore(riskData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // If viewing live location, re-request it
    if (viewingLocation?.isLive || !viewingLocation) {
      requestUserLocation();
    } else {
      // Re-fetch weather for the manually selected location
      loadWeatherData(viewingLocation.lat, viewingLocation.lon);
    }
  };

  const handleStateSelect = (state: string, city: string, lat: number, lon: number) => {
    setViewingLocation({ lat, lon, city, state, isLive: false });
    loadWeatherData(lat, lon);
  };

  const handleBackToLiveLocation = () => {
    if (userLocation) {
      setViewingLocation({ ...userLocation, city: userLocation.city || 'Your Location', state: userLocation.state || '', isLive: true });
      loadWeatherData(userLocation.lat, userLocation.lon);
    } else {
      requestUserLocation();
    }
  };

  const loadInsights = async () => {
    try {
      const insightsData = await weatherAPI.getInsights(selectedCrop);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        loadWeatherData(); // Load default weather if not logged in
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = response.data.user || response.data;
      setUserProfile(profile);

      // Check if user has saved location
      if (profile.location_lat && profile.location_lon) {
        // User has a saved location - use it automatically
        const lat = profile.location_lat;
        const lon = profile.location_lon;

        // Reverse geocode to get location name
        try {
          const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=90d15b7fdfc7a271fe97287339babf47`
          );
          const geoData = await geoResponse.json();
          const city = geoData[0]?.name || 'Your Location';
          const state = geoData[0]?.state || '';

          setUserLocation({ lat, lon, city, state });
          setViewingLocation({ lat, lon, city, state, isLive: true });
          setLocationStatus('success');
          loadWeatherData(lat, lon);
        } catch (error) {
          // Fallback without location name
          setUserLocation({ lat, lon });
          setViewingLocation({ lat, lon, city: 'Your Location', state: '', isLive: true });
          setLocationStatus('success');
          loadWeatherData(lat, lon);
        }
      } else {
        // No saved location - load default weather
        loadWeatherData();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      loadWeatherData(); // Load default weather on error
    }
  };

  const handleToggleAlert = async (type: 'email' | 'sms', enabled: boolean) => {
    try {
      setSavingPreferences(true);
      const token = localStorage.getItem('access_token');

      const updatedProfile = {
        ...userProfile,
        [type === 'email' ? 'receive_email_alerts' : 'receive_sms_alerts']: enabled,
      };

      await axios.put(
        'http://127.0.0.1:8000/api/auth/profile/',
        updatedProfile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSavingPreferences(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Location */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-md">
                  Weather & Climate Intelligence
                </h1>
              </div>

              {/* Location Display */}
              <div className="flex items-center gap-3 flex-wrap">
                {viewingLocation?.isLive && locationStatus === 'success' && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <Navigation size={18} className="fill-current text-white animate-pulse" />
                    <p className="font-semibold text-white">
                      {viewingLocation.city} {viewingLocation.state && `(${viewingLocation.state})`}
                    </p>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md">
                      🌍 LIVE
                    </span>
                  </div>
                )}

                {viewingLocation && !viewingLocation.isLive && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <MapPin size={18} className="text-white" />
                    <p className="font-semibold text-white">
                      {viewingLocation.city}, {viewingLocation.state}
                    </p>
                    <button
                      onClick={handleBackToLiveLocation}
                      className="ml-2 px-3 py-1.5 bg-white text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all duration-300 flex items-center gap-1 shadow-md"
                    >
                      <Navigation size={12} className="fill-current" />
                      Back to Live
                    </button>
                  </div>
                )}

                {locationStatus === 'requesting' && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <p className="text-sm text-white font-medium">Detecting your location...</p>
                  </div>
                )}

                {!viewingLocation && locationStatus !== 'requesting' && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <MapPin size={18} className="text-white" />
                    <p className="text-white font-medium">Kuala Lumpur (Default)</p>
                  </div>
                )}
              </div>

              {locationError && !viewingLocation && (
                <div className="mt-3">
                  <div className="bg-yellow-500/90 backdrop-blur-sm border-l-4 border-yellow-300 p-4 rounded-lg shadow-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-white mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-white font-semibold">{locationError}</p>
                        <button
                          onClick={requestUserLocation}
                          className="mt-2 px-3 py-1 bg-white text-yellow-700 font-bold text-sm rounded-lg hover:bg-yellow-50 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={requestUserLocation}
                disabled={locationStatus === 'requesting'}
                className="group relative px-5 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
                <Navigation size={20} className={`relative ${locationStatus === 'requesting' ? 'animate-pulse' : ''}`} />
                <span className="relative">
                  {locationStatus === 'requesting' ? 'Locating...' : 'Share Location'}
                </span>
              </button>

              <button
                onClick={() => setShowStateSelector(!showStateSelector)}
                className="group relative px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
                <Globe size={20} className="relative" />
                <span className="relative">Other States</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* State Selector Panel */}
        {showStateSelector && (
          <StateSelector
            onStateSelect={handleStateSelect}
            onClose={() => setShowStateSelector(false)}
            currentLocation={viewingLocation?.isLive ? `${viewingLocation.city}${viewingLocation.state ? ', ' + viewingLocation.state : ''} (Live)` : undefined}
          />
        )}

        {/* Weather Alerts - Enhanced */}
        {alerts && alerts.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-8 shadow-lg border border-red-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent">Weather Alerts</h2>
                <p className="text-sm text-gray-600 mt-1">Important warnings for your farm</p>
              </div>
              <span className="ml-auto bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md animate-pulse">
                {alerts.length} Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert, index) => (
                <WeatherAlertCard key={index} {...alert} />
              ))}
            </div>
          </div>
        )}

        {/* Current Weather Stats - Enhanced */}
        {currentWeather && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-3 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-blue-600 bg-clip-text text-transparent">Current Conditions</h2>
                <p className="text-sm text-gray-600 mt-1">Real-time weather data for your location</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <WeatherStatCard
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                }
                label="Temperature"
                value={Math.round(currentWeather.temperature)}
                unit="°C"
                color="orange"
              />

              <WeatherStatCard
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5c0 .536.17 1.031.459 1.436C2.57 7.417 2 8.15 2 9c0 1.105.895 2 2 2h10c1.105 0 2-.895 2-2 0-.85-.57-1.583-1.459-2.064A2.488 2.488 0 0 0 15 5.5 2.5 2.5 0 0 0 12.5 3c-.76 0-1.438.337-1.898.87A2.99 2.99 0 0 0 8 3a2.99 2.99 0 0 0-2.602.87A2.486 2.486 0 0 0 5.5 3z" clipRule="evenodd" />
                  </svg>
                }
                label="Humidity"
                value={Math.round(currentWeather.humidity)}
                unit="%"
                color="blue"
              />

              <WeatherStatCard
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                }
                label="Wind Speed"
                value={Math.round(currentWeather.wind_speed)}
                unit="km/h"
                color="green"
              />

              <WeatherStatCard
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                }
                label="Rain Probability"
                value={Math.round(currentWeather.rain_probability || 0)}
                unit="%"
                color="purple"
              />
            </div>
          </div>
        )}

        {/* Climate Risk Score and Forecast - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Climate Risk Score */}
          <div className="lg:col-span-1">
            {riskScore && <ClimateRiskCard {...riskScore} />}
          </div>

          {/* Weather Forecast */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-indigo-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">3-Day Forecast</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Plan your farming activities ahead</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {forecast.slice(0, 3).map((day, index) => (
                  <ForecastCard key={index} {...day} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Alert Subscription */}
        {userProfile && (
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-blue-200 mb-8">
            <div className="flex items-center mb-4">
              <Bell className="w-6 h-6 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Weather Alert Subscriptions</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Receive daily weather updates and alerts directly to your email
            </p>

            <div className="space-y-4">
              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">Email Alerts</p>
                    <p className="text-sm text-gray-600">Daily weather updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userProfile.receive_email_alerts || false}
                    onChange={(e) => handleToggleAlert('email', e.target.checked)}
                    disabled={savingPreferences}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"></div>
                </label>
              </div>
            </div>

            {!userProfile.location_lat || !userProfile.location_lon ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Set your farm location in your <a href="/user/profile" className="underline font-medium hover:text-blue-900">profile</a> to receive location-specific weather updates
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Layout >
  );
};
