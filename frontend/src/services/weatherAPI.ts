/**
 * Weather API service
 * Handles all API calls to the weather endpoints
 */
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/weather';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const weatherAPI = {
  // Get current weather
  getCurrentWeather: async (lat?: number, lon?: number) => {
    const params = lat && lon ? { lat, lon } : {};
    const response = await axios.get(`${API_BASE_URL}/current/`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get weather forecast
  getForecast: async (lat?: number, lon?: number, days: number = 3) => {
    const params: any = { days };
    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    }
    const response = await axios.get(`${API_BASE_URL}/forecast/`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get weather alerts
  getAlerts: async (lat?: number, lon?: number) => {
    const params = lat && lon ? { lat, lon } : {};
    const response = await axios.get(`${API_BASE_URL}/alerts/`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get stored alerts
  getStoredAlerts: async () => {
    const response = await axios.get(`${API_BASE_URL}/alerts/stored/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Mark alert as read
  markAlertRead: async (alertId: number) => {
    const response = await axios.post(
      `${API_BASE_URL}/alerts/${alertId}/read/`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get climate risk score
  getRiskScore: async (lat?: number, lon?: number) => {
    const params = lat && lon ? { lat, lon } : {};
    const response = await axios.get(`${API_BASE_URL}/risk-score/`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get agricultural insights
  getInsights: async (crop?: string, lat?: number, lon?: number) => {
    const params: any = {};
    if (crop) params.crop = crop;
    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    }
    const response = await axios.get(`${API_BASE_URL}/insights/`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get weather history
  getHistory: async (days: number = 7) => {
    const response = await axios.get(`${API_BASE_URL}/history/`, {
      params: { days },
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Get/update user location
  getLocation: async () => {
    const response = await axios.get(`${API_BASE_URL}/location/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateLocation: async (location: {
    city: string;
    state?: string;
    latitude: number;
    longitude: number;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/location/`, location, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
