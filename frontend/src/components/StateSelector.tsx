/**
 * StateSelector Component
 * Allows farmers to check weather for other Malaysian states
 * Separate from LocationSelector (which is for soil analysis field locations)
 */
import React from 'react';
import { MapPin, X } from 'lucide-react';

// Malaysian states with major cities and their coordinates
const MALAYSIAN_STATES = {
  'Johor': { cities: ['Johor Bahru', 'Muar', 'Batu Pahat', 'Kluang'], lat: 1.4854, lon: 103.3619 },
  'Kedah': { cities: ['Alor Setar', 'Sungai Petani', 'Kulim', 'Langkawi'], lat: 6.1184, lon: 100.3681 },
  'Kelantan': { cities: ['Kota Bharu', 'Pasir Mas', 'Tanah Merah', 'Gua Musang'], lat: 6.1256, lon: 102.2381 },
  'Kuala Lumpur': { cities: ['City Centre', 'Cheras', 'Bangsar', 'Mont Kiara'], lat: 3.1390, lon: 101.6869 },
  'Labuan': { cities: ['Victoria'], lat: 5.2831, lon: 115.2308 },
  'Melaka': { cities: ['Melaka City', 'Alor Gajah', 'Jasin'], lat: 2.1896, lon: 102.2501 },
  'Negeri Sembilan': { cities: ['Seremban', 'Port Dickson', 'Nilai'], lat: 2.7258, lon: 101.9424 },
  'Pahang': { cities: ['Kuantan', 'Temerloh', 'Bentong', 'Cameron Highlands'], lat: 3.8077, lon: 103.3260 },
  'Penang': { cities: ['George Town', 'Butterworth', 'Bukit Mertajam'], lat: 5.4141, lon: 100.3288 },
  'Perak': { cities: ['Ipoh', 'Taiping', 'Teluk Intan', 'Kuala Kangsar'], lat: 4.5975, lon: 101.0901 },
  'Perlis': { cities: ['Kangar', 'Arau'], lat: 6.4449, lon: 100.2048 },
  'Putrajaya': { cities: ['Precinct 1', 'Precinct 8'], lat: 2.9264, lon: 101.6964 },
  'Sabah': { cities: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu'], lat: 5.9788, lon: 116.0753 },
  'Sarawak': { cities: ['Kuching', 'Miri', 'Sibu', 'Bintulu'], lat: 1.5533, lon: 110.3592 },
  'Selangor': { cities: ['Shah Alam', 'Petaling Jaya', 'Klang', 'Subang Jaya'], lat: 3.0738, lon: 101.5183 },
  'Terengganu': { cities: ['Kuala Terengganu', 'Kemaman', 'Dungun'], lat: 5.3117, lon: 103.1324 },
};

interface StateSelectorProps {
  onStateSelect: (state: string, city: string, lat: number, lon: number) => void;
  onClose: () => void;
  currentLocation?: string;
}

export const StateSelector: React.FC<StateSelectorProps> = ({ 
  onStateSelect, 
  onClose,
  currentLocation 
}) => {
  const [selectedState, setSelectedState] = React.useState<string>('');
  const [selectedCity, setSelectedCity] = React.useState<string>('');

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity(''); // Reset city when state changes
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleCheckWeather = () => {
    if (selectedState && selectedCity) {
      const stateData = MALAYSIAN_STATES[selectedState as keyof typeof MALAYSIAN_STATES];
      onStateSelect(selectedState, selectedCity, stateData.lat, stateData.lon);
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <MapPin size={20} />
          <h3 className="font-semibold">Check Other State Weather</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {currentLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <MapPin size={16} className="text-green-600 fill-current" />
            <p className="text-sm text-green-800">
              <span className="font-medium">Current:</span> {currentLocation}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Choose a state...</option>
            {Object.keys(MALAYSIAN_STATES).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {selectedState && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Choose a city...</option>
              {MALAYSIAN_STATES[selectedState as keyof typeof MALAYSIAN_STATES].cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCheckWeather}
            disabled={!selectedState || !selectedCity}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            Check Weather
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            You can check weather forecasts for any Malaysian state while keeping your live location active
          </p>
        </div>
      </div>
    </div>
  );
};
