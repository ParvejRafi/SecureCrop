/**
 * Forecast Card Component
 * Displays a single day's weather forecast
 */
import React from 'react';

interface ForecastCardProps {
  date: string;
  temperature_max: number;
  temperature_min: number;
  rain_probability: number;
  condition: string;
  condition_icon: string;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  date,
  temperature_max,
  temperature_min,
  rain_probability,
  condition,
  condition_icon,
}) => {
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric' });

  // Get weather icon from OpenWeatherMap
  const iconUrl = `https://openweathermap.org/img/wn/${condition_icon}@2x.png`;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center">
      <p className="text-sm font-semibold text-gray-700">{dayName}</p>
      <p className="text-xs text-gray-500 mb-2">{dayNum}</p>
      
      <img
        src={iconUrl}
        alt={condition}
        className="w-16 h-16 mx-auto"
        onError={(e) => {
          e.currentTarget.src = 'https://openweathermap.org/img/wn/01d@2x.png';
        }}
      />
      
      <p className="text-xs text-gray-600 mb-2 truncate">{condition}</p>
      
      <div className="flex justify-center gap-2 mb-2">
        <span className="text-lg font-bold text-gray-900">{Math.round(temperature_max)}°</span>
        <span className="text-lg text-gray-400">{Math.round(temperature_min)}°</span>
      </div>
      
      {rain_probability > 0 && (
        <div className="flex items-center justify-center gap-1 text-blue-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5c0 .536.17 1.031.459 1.436C2.57 7.417 2 8.15 2 9c0 1.105.895 2 2 2h10c1.105 0 2-.895 2-2 0-.85-.57-1.583-1.459-2.064A2.488 2.488 0 0 0 15 5.5 2.5 2.5 0 0 0 12.5 3c-.76 0-1.438.337-1.898.87A2.99 2.99 0 0 0 8 3a2.99 2.99 0 0 0-2.602.87A2.486 2.486 0 0 0 5.5 3z" clipRule="evenodd"/>
          </svg>
          <span className="text-xs font-medium">{Math.round(rain_probability)}%</span>
        </div>
      )}
    </div>
  );
};
