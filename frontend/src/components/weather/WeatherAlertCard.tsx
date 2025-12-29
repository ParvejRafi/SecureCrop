/**
 * Weather Alert Card Component
 * Displays individual weather alert with icon and severity styling
 */
import React from 'react';

interface WeatherAlertCardProps {
  type: string;
  severity: string;
  title: string;
  message: string;
  icon: string;
}

const severityColors = {
  INFO: 'bg-blue-50 border-blue-200 text-blue-900',
  SUCCESS: 'bg-green-50 border-green-200 text-green-900',
  WARNING: 'bg-amber-50 border-amber-200 text-amber-900',
  DANGER: 'bg-red-50 border-red-200 text-red-900',
};

const severityBadgeColors = {
  INFO: 'bg-blue-100 text-blue-800',
  SUCCESS: 'bg-green-100 text-green-800',
  WARNING: 'bg-amber-100 text-amber-800',
  DANGER: 'bg-red-100 text-red-800',
};

export const WeatherAlertCard: React.FC<WeatherAlertCardProps> = ({
  type,
  severity,
  title,
  message,
  icon,
}) => {
  const colorClass = severityColors[severity as keyof typeof severityColors] || severityColors.INFO;
  const badgeClass = severityBadgeColors[severity as keyof typeof severityBadgeColors] || severityBadgeColors.INFO;

  return (
    <div className={`rounded-xl border-2 p-4 ${colorClass} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeClass}`}>
              {severity}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
};
