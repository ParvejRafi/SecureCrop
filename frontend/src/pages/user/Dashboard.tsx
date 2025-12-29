import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Card, StatCard } from '../../components/UI';
import { soilAPI, recommendationAPI } from '../../services/api';
import { weatherAPI } from '../../services/weatherAPI';
import { Sprout, FileText, TrendingUp, Clock, Cloud, Droplets, Wind, Eye, AlertCircle, Calendar, Navigation } from 'lucide-react';
import type { SoilInput, Recommendation } from '../../types';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInputs: 0,
    totalRecommendations: 0,
  });
  const [recentInputs, setRecentInputs] = useState<SoilInput[]>([]);
  const [latestRecommendation, setLatestRecommendation] = useState<Recommendation | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; city?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Request user's location on button click (not automatic)
  const requestLocation = () => {
    if (!navigator.geolocation) {
      loadDataWithoutLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city name
        try {
          const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=90d15b7fdfc7a271fe97287339babf47`
          );
          const geoData = await geoResponse.json();
          const city = geoData[0]?.name || 'Your Location';
          setUserLocation({ lat: latitude, lon: longitude, city });
        } catch (error) {
          setUserLocation({ lat: latitude, lon: longitude });
        }

        // Fetch weather with location
        const [weather, alerts] = await Promise.all([
          weatherAPI.getCurrentWeather(latitude, longitude).catch(() => null),
          weatherAPI.getAlerts(latitude, longitude).catch(() => []),
        ]);

        setWeatherData(weather);
        setWeatherAlerts(Array.isArray(alerts) ? alerts : []);
      },
      () => {
        // If geolocation fails, load without location
        loadDataWithoutLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  };

  const loadDataWithoutLocation = async () => {
    const [weather, alerts] = await Promise.all([
      weatherAPI.getCurrentWeather().catch(() => null),
      weatherAPI.getAlerts().catch(() => []),
    ]);

    setWeatherData(weather);
    setWeatherAlerts(Array.isArray(alerts) ? alerts : []);
  };

  // Load dashboard data (without automatic geolocation)
  const fetchData = async () => {
    try {
      const [inputs, recommendations, weather, alerts] = await Promise.all([
        soilAPI.getSoilInputs(),
        recommendationAPI.getRecommendations(),
        weatherAPI.getCurrentWeather().catch(() => null),
        weatherAPI.getAlerts().catch(() => []),
      ]);

      setStats({
        totalInputs: inputs.length,
        totalRecommendations: recommendations.length,
      });

      setRecentInputs(inputs.slice(0, 5));

      if (recommendations.length > 0) {
        setLatestRecommendation(recommendations[0]);
      }

      setWeatherData(weather);
      setWeatherAlerts(Array.isArray(alerts) ? alerts : []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your crop recommendation system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Soil Analyses"
            value={stats.totalInputs}
            icon={<FileText size={24} />}
            color="blue"
          />
          <StatCard
            title="Crop Recommendations"
            value={stats.totalRecommendations}
            icon={<Sprout size={24} />}
            color="green"
          />
          <StatCard
            title="Success Rate"
            value="98%"
            icon={<TrendingUp size={24} />}
            color="purple"
          />
        </div>

        {/* Weather Widget */}
        {weatherData && (
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6">
              {/* Weather Alerts */}
              {weatherAlerts.length > 0 && (
                <div className="mb-6 space-y-3">
                  {weatherAlerts.slice(0, 2).map((alert: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${alert.severity === 'high' || alert.severity === 'extreme'
                        ? 'bg-red-50 border-red-500'
                        : alert.severity === 'medium'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                        }`}
                    >
                      <AlertCircle
                        size={20}
                        className={`mt-0.5 ${alert.severity === 'high' || alert.severity === 'extreme'
                          ? 'text-red-600'
                          : alert.severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                          }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{alert.alert_type || 'Weather Alert'}</h4>
                        <p className="text-sm text-gray-700 mt-1">{alert.message || alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Weather Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Cloud size={32} className="text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Current Weather</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {userLocation ? (
                        <>
                          <Navigation size={14} className="text-green-600 fill-current" />
                          <p className="text-sm text-green-600 font-medium">
                            {userLocation.city || 'Your Location'} (Live)
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {weatherData.location || 'Kuala Lumpur'} • Click to share location
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!userLocation && (
                    <button
                      onClick={requestLocation}
                      className="px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                    >
                      <Navigation size={16} />
                      <span className="hidden sm:inline">Share Location</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/user/weather')}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Eye size={18} />
                    View Forecast
                  </button>
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Temperature */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <Cloud size={18} className="text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {weatherData.temperature?.toFixed(0) || '--'}°C
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Feels like {weatherData.feels_like?.toFixed(0) || '--'}°C
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Humidity</span>
                    <Droplets size={18} className="text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {weatherData.humidity || '--'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {weatherData.humidity > 70 ? 'High' : weatherData.humidity > 40 ? 'Moderate' : 'Low'}
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Wind Speed</span>
                    <Wind size={18} className="text-gray-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {weatherData.wind_speed?.toFixed(1) || '--'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">km/h</div>
                </div>

                {/* Rain Chance */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Rain Chance</span>
                    <Droplets size={18} className="text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {weatherData.rain_chance ?? weatherData.rain_probability ?? '--'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(weatherData.rain_chance ?? weatherData.rain_probability ?? 0) > 60 ? 'Likely' : 'Unlikely'}
                  </div>
                </div>
              </div>

              {/* Weather Description */}
              {weatherData.description && (
                <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} />
                    <span className="font-medium">Conditions:</span>
                    <span className="capitalize">{weatherData.description}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Latest Recommendation */}
        {latestRecommendation && (
          <Card title="Latest Crop Recommendation" icon={<Sprout size={20} />}>
            <div className="space-y-4">
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  Recommended Crop: {latestRecommendation.crop_name}
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {latestRecommendation.explanation}
                </p>
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <Clock size={14} className="mr-1" />
                {new Date(latestRecommendation.created_at).toLocaleString()}
              </p>
            </div>
          </Card>
        )}

        {/* Recent Inputs */}
        <Card title="Recent Soil Inputs" icon={<FileText size={20} />}>
          {recentInputs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">K</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">pH</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moisture</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInputs.map((input) => (
                    <tr key={input.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(input.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.N_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.P_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.K_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.ph.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.moisture.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No soil inputs yet. Start by analyzing your soil!</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default UserDashboard;
