/**
 * Climate Risk Score Card Component
 * Displays the overall climate risk score with visual indicator
 */
import React from 'react';

interface ClimateRiskCardProps {
  score: number;
  level: string;
  color: string;
  description: string;
  recommendations: string[];
}

export const ClimateRiskCard: React.FC<ClimateRiskCardProps> = ({
  score,
  level,
  color,
  description,
  recommendations,
}) => {
  // Calculate stroke dash offset for circular progress
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Risk Score</h3>
      
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>
              {score}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>

        {/* Risk Info */}
        <div className="flex-1">
          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {level} Risk
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {recommendations && recommendations.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700">Recommendations:</p>
              {recommendations.slice(0, 2).map((rec, idx) => (
                <p key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-gray-400">•</span>
                  <span>{rec}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
