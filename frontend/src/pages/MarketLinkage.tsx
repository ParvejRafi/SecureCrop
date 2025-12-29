/**
 * Market Linkage - Find Nearby Agricultural Facilities
 * Modern Professional Design with GPS-Based Location
 */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '../components/Layout';
import { 
  MapPin, Store, Users, ShoppingBag, Navigation, 
  Star, MapIcon, List, Loader2, AlertCircle, Phone, 
  Clock, TrendingUp, Locate, CheckCircle, XCircle, Target, Zap, Activity
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different place types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">${icon}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const userIcon = createCustomIcon('#3b82f6', '📍');
const marketIcon = createCustomIcon('#10b981', '🏪');
const buyerIcon = createCustomIcon('#ef4444', '👥');
const storeIcon = createCustomIcon('#3b82f6', '🛒');

interface Location {
  lat: number;
  lon: number;
  accuracy?: number;
  city?: string;
}

interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance_km?: number;
  rating?: number;
  type: string;
  address?: string;
  phone?: string;
  opening_hours?: string;
}

// Component to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const MarketLinkage: React.FC = () => {
  // Location Permission State
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([3.139, 101.6869]);
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<Place[]>([]);
  const [buyers, setBuyers] = useState<Place[]>([]);
  const [agriStores, setAgriStores] = useState<Place[]>([]);
  const [allResults, setAllResults] = useState<Place[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeTab, setActiveTab] = useState<'all' | 'markets' | 'buyers' | 'stores'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Request location permission on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location services');
      setLocationPermission('denied');
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
      
      if (result.state === 'granted') {
        getUserLocation();
      }
    } catch (err) {
      console.log('Permission API not supported, will request on button click');
    }
  };

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location: Location = { 
          lat: latitude, 
          lon: longitude,
          accuracy: accuracy
        };
        
        setUserLocation(location);
        setMapCenter([latitude, longitude]);
        setLocationPermission('granted');
        searchNearbyPlaces(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        
        if (error.code === 1) {
          setError('Location permission denied. Please enable location access to find nearby markets.');
        } else if (error.code === 2) {
          setError('Location unavailable. Please check your device settings.');
        } else if (error.code === 3) {
          setError('Location request timeout. Please try again.');
        }
        
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const searchNearbyPlaces = async (lat: number, lon: number) => {
    const radius = radiusKm * 1000;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/api/market/search/all/`, {
        params: { lat, lon, radius },
        headers,
      });

      const data = response.data;
      const results = Array.isArray(data) ? data : (data.results || []);
      
      const marketsData = results.filter((p: Place) => p.type === 'market');
      const buyersData = results.filter((p: Place) => p.type === 'buyer');
      const storesData = results.filter((p: Place) => p.type === 'agri_store');

      setMarkets(marketsData);
      setBuyers(buyersData);
      setAgriStores(storesData);
      setAllResults(results);
      setLoading(false);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Failed to search nearby places');
      setLoading(false);
    }
  };

  const handleRefreshLocation = () => {
    getUserLocation();
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    if (userLocation) {
      searchNearbyPlaces(userLocation.lat, userLocation.lon);
    }
  };

  const handleNavigate = (place: Place) => {
    if (!userLocation) {
      alert('Please enable location access first');
      return;
    }

    // Get user's actual current location for navigation origin
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const originLat = position.coords.latitude;
          const originLon = position.coords.longitude;
          
          const searchQuery = place.address 
            ? `${place.name}, ${place.address}`
            : place.name;
          
          const destinationQuery = encodeURIComponent(searchQuery);
          const urlWithName = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLon}&destination=${destinationQuery}&travelmode=driving`;
          
          window.open(urlWithName, '_blank');
        },
        (error) => {
          console.warn('GPS error:', error.message);
          const searchQuery = place.address ? `${place.name}, ${place.address}` : place.name;
          const destinationQuery = encodeURIComponent(searchQuery);
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${destinationQuery}&travelmode=driving`;
          window.open(url, '_blank');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter([place.lat, place.lon]);
    if (viewMode === 'list') {
      setViewMode('map');
    }
  };

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'market': return { icon: '🏪', color: 'text-green-600', bg: 'bg-green-50' };
      case 'buyer': return { icon: '👥', color: 'text-red-600', bg: 'bg-red-50' };
      case 'agri_store': return { icon: '🛒', color: 'text-blue-600', bg: 'bg-blue-50' };
      default: return { icon: '📍', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getFilteredResults = () => {
    let results: Place[] = [];
    
    switch (activeTab) {
      case 'markets': results = markets; break;
      case 'buyers': results = buyers; break;
      case 'stores': results = agriStores; break;
      default: results = allResults;
    }

    results.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    return results;
  };

  const filteredResults = getFilteredResults();

  // Location Permission Screen
  if (locationPermission === 'prompt' || locationPermission === 'denied') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-4 shadow-lg">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    Market Finder
                  </h1>
                  <p className="text-white/90 text-lg">
                    Find nearby markets, buyers, and agricultural stores
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {locationPermission === 'denied' && error ? (
                  <>
                    {/* Error State */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-900 mb-2">
                            Location Access Required
                          </h3>
                          <p className="text-red-700 mb-4">
                            {error}
                          </p>
                          <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-gray-700">
                            <p className="font-semibold">How to enable location:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                              <li>Click the lock icon 🔒 in your browser's address bar</li>
                              <li>Find "Location" permissions</li>
                              <li>Select "Allow"</li>
                              <li>Refresh this page</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Initial Prompt State */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                        <Locate className="w-12 h-12 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Enable Your Location
                      </h2>
                      <p className="text-gray-600 text-lg mb-6">
                        We need your location to show nearby markets and help you navigate to them
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        What you'll get:
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                            1
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Nearby Markets & Buyers</p>
                            <p className="text-sm text-gray-600">Find the closest places to buy supplies or sell your harvest</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                            2
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Turn-by-Turn Navigation</p>
                            <p className="text-sm text-gray-600">Get directions from your exact location to any market</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                            3
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Distance & Contact Info</p>
                            <p className="text-sm text-gray-600">See how far each place is and get their phone numbers</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Button */}
                <button
                  onClick={getUserLocation}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Getting your location...
                    </>
                  ) : (
                    <>
                      <Locate className="w-6 h-6" />
                      {locationPermission === 'denied' ? 'Try Again' : 'Enable Location & Continue'}
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>🔒 Your location is only used to find nearby places and is never stored or shared</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main Content - After Location Permission Granted
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl mb-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-lg p-3 rounded-2xl">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                      Market Finder
                    </h1>
                    <p className="text-white/90 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Location Enabled
                      {userLocation?.accuracy && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          ±{Math.round(userLocation.accuracy)}m accuracy
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">{markets.length}</div>
                    <div className="text-white/90 text-xs">Markets</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">{buyers.length}</div>
                    <div className="text-white/90 text-xs">Buyers</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">{agriStores.length}</div>
                    <div className="text-white/90 text-xs">Stores</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Refresh Location */}
              <button
                onClick={handleRefreshLocation}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                <Locate className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Location
              </button>

              {/* Search Radius */}
              <div className="flex items-center gap-3 flex-1">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Search Radius:
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                  {radiusKm} km
                </span>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-white text-green-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-white text-green-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({allResults.length})
              </button>
              <button
                onClick={() => setActiveTab('markets')}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'markets'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏪 Markets ({markets.length})
              </button>
              <button
                onClick={() => setActiveTab('buyers')}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'buyers'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 Buyers ({buyers.length})
              </button>
              <button
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'stores'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🛒 Stores ({agriStores.length})
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Map or List View */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '700px' }}>
                
                {viewMode === 'map' ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-2xl"
                  >
                    <RecenterMap center={mapCenter} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User Location */}
                    {userLocation && (
                      <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                        <Popup>
                          <div className="text-center p-2">
                            <p className="font-bold text-blue-600 text-lg mb-1">📍 Your Location</p>
                            {userLocation.accuracy && (
                              <p className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
                                Accuracy: ±{Math.round(userLocation.accuracy)} meters
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Places */}
                    {filteredResults.map((place) => {
                      const icon = place.type === 'market' ? marketIcon 
                                : place.type === 'buyer' ? buyerIcon 
                                : storeIcon;
                      
                      return (
                        <Marker
                          key={place.id}
                          position={[place.lat, place.lon]}
                          icon={icon}
                          eventHandlers={{
                            click: () => handlePlaceClick(place)
                          }}
                        >
                          <Popup>
                            <div className="p-2" style={{ minWidth: '280px' }}>
                              <h3 className="font-bold text-xl mb-2 text-gray-900">{place.name}</h3>
                              
                              {place.rating && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                  <span className="font-bold text-lg">{place.rating.toFixed(1)}</span>
                                </div>
                              )}
                              
                              {place.distance_km !== undefined && (
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow">
                                    📍 {place.distance_km.toFixed(1)} km away
                                  </div>
                                </div>
                              )}
                              
                              {place.address && (
                                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">{place.address}</p>
                              )}

                              <button
                                onClick={() => handleNavigate(place)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50"
                              >
                                <Navigation className="w-5 h-5" />
                                Navigate Here
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                ) : (
                  <div className="overflow-y-auto h-full p-4">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-semibold">Searching nearby...</p>
                      </div>
                    ) : filteredResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <MapPin className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-semibold">No places found</p>
                        <p className="text-sm text-gray-500 mt-2">Try increasing the search radius</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredResults.map((place) => {
                          const placeIcon = getPlaceIcon(place.type);
                          return (
                            <div
                              key={place.id}
                              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => handlePlaceClick(place)}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 ${placeIcon.bg} rounded-xl flex items-center justify-center text-2xl`}>
                                  {placeIcon.icon}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg mb-1">{place.name}</h3>
                                  
                                  {place.distance_km !== undefined && (
                                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {place.distance_km.toFixed(1)} km away
                                    </p>
                                  )}
                                  
                                  {place.address && (
                                    <p className="text-xs text-gray-500 mb-3">{place.address}</p>
                                  )}

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNavigate(place);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                                  >
                                    <Navigation className="w-4 h-4" />
                                    Navigate
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <List className="w-6 h-6" />
                    Results ({filteredResults.length})
                  </h2>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '636px' }}>
                  {loading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-10 h-10 text-green-600 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-600 font-semibold">Searching...</p>
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="p-8 text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-semibold">No results</p>
                      <p className="text-sm text-gray-500 mt-2">Try increasing the radius</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredResults.slice(0, 20).map((place) => {
                        const placeIcon = getPlaceIcon(place.type);
                        return (
                          <div
                            key={place.id}
                            onClick={() => handlePlaceClick(place)}
                            className="p-3 mb-2 bg-gray-50 hover:bg-green-50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-green-500"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-10 h-10 ${placeIcon.bg} rounded-lg flex items-center justify-center text-xl`}>
                                {placeIcon.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">{place.name}</h3>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {place.distance_km?.toFixed(1)} km
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarketLinkage;
