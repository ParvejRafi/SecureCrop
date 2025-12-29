/**
 * LocationSelector Component
 * Allows farmers to select and save their farm/field location
 * Supports:
 * - Malaysian states and cities
 * - Manual lat/long input
 * - Browser geolocation
 * - Custom location names (farm/field names)
 */
import React, { useState, useEffect } from 'react';
import { MapPin, Crosshair, AlertCircle } from 'lucide-react';

// Malaysian states and major cities
const MALAYSIAN_LOCATIONS: Record<string, string[]> = {
  'Johor': ['Johor Bahru', 'Muar', 'Batu Pahat', 'Kluang', 'Pontian'],
  'Kedah': ['Alor Setar', 'Sungai Petani', 'Kulim', 'Langkawi', 'Jitra'],
  'Kelantan': ['Kota Bharu', 'Kuala Krai', 'Tanah Merah', 'Pasir Mas', 'Gua Musang'],
  'Melaka': ['Melaka City', 'Alor Gajah', 'Jasin'],
  'Negeri Sembilan': ['Seremban', 'Port Dickson', 'Bahau', 'Kuala Pilah'],
  'Pahang': ['Kuantan', 'Temerloh', 'Bentong', 'Raub', 'Pekan'],
  'Penang': ['Georgetown', 'Butterworth', 'Bukit Mertajam', 'Balik Pulau'],
  'Perak': ['Ipoh', 'Taiping', 'Teluk Intan', 'Kampar', 'Kuala Kangsar'],
  'Perlis': ['Kangar', 'Arau', 'Padang Besar'],
  'Sabah': ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau'],
  'Sarawak': ['Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang'],
  'Selangor': ['Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang', 'Kajang'],
  'Terengganu': ['Kuala Terengganu', 'Kemaman', 'Dungun', 'Marang'],
  'Kuala Lumpur': ['Kuala Lumpur'],
  'Putrajaya': ['Putrajaya'],
  'Labuan': ['Labuan'],
};

export interface LocationData {
  location_name?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  required?: boolean;
  showCoordinates?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  required = false,
  showCoordinates = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedState, setSelectedState] = useState(value.state || '');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedState && MALAYSIAN_LOCATIONS[selectedState]) {
      setCities(MALAYSIAN_LOCATIONS[selectedState]);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    onChange({
      ...value,
      state,
      city: '',
    });
  };

  const handleCityChange = (city: string) => {
    onChange({
      ...value,
      city,
    });
  };

  const handleLocationNameChange = (location_name: string) => {
    onChange({
      ...value,
      location_name,
    });
  };

  const handleCoordinatesChange = (field: 'latitude' | 'longitude', val: string) => {
    const numValue = val === '' ? undefined : parseFloat(val);
    onChange({
      ...value,
      [field]: numValue,
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...value,
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6)),
        });
        setLoading(false);
      },
      () => {
        setError('Unable to retrieve your location. Please enter manually.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="text-green-600" size={20} />
        <h3 className="font-semibold text-gray-900">Farm Location</h3>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Location Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Farm/Field Name (Optional)
        </label>
        <input
          type="text"
          value={value.location_name || ''}
          onChange={(e) => handleLocationNameChange(e.target.value)}
          placeholder="e.g., Paddy Field A, North Farm, etc."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* State Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select State</option>
          {Object.keys(MALAYSIAN_LOCATIONS).sort().map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* City Selection */}
      {selectedState && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City/District {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value.city || ''}
            onChange={(e) => handleCityChange(e.target.value)}
            required={required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Coordinates */}
      {showCoordinates && (
        <>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                GPS Coordinates (Optional)
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Crosshair size={16} />
                <span>{loading ? 'Getting...' : 'Use My Location'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={value.latitude || ''}
                  onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                  placeholder="e.g., 3.139003"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={value.longitude || ''}
                  onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                  placeholder="e.g., 101.686855"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Precise coordinates help provide accurate weather forecasts for your exact location
            </p>
          </div>
        </>
      )}

      {/* Location Summary */}
      {(value.state || value.city || value.location_name) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-900">Selected Location:</p>
          <p className="text-sm text-green-800 mt-1">
            {[value.location_name, value.city, value.state].filter(Boolean).join(', ')}
            {value.latitude && value.longitude && (
              <span className="block text-xs text-green-600 mt-1">
                GPS: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
