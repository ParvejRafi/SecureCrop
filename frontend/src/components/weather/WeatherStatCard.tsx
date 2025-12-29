/**
 * Weather Stat Card Component
 * Displays a single weather metric with icon
 */
import React from 'react';

interface WeatherStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export const WeatherStatCard: React.FC<WeatherStatCardProps> = ({
  icon,
  label,
  value,
  unit = '',
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${bgClass} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-lg font-normal text-gray-600 ml-1">{unit}</span>}
      </p>
    </div>
  );
};
