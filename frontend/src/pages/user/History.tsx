import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, Badge } from '../../components/UI';
import { soilAPI, recommendationAPI } from '../../services/api';
import { FileText, Sprout, MapPin } from 'lucide-react';
import type { SoilInput, Recommendation } from '../../types';

const History: React.FC = () => {
  const [inputs, setInputs] = useState<SoilInput[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inputsData, recsData] = await Promise.all([
          soilAPI.getSoilInputs(),
          recommendationAPI.getRecommendations(),
        ]);
        setInputs(inputsData);
        setRecommendations(recsData);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>

        <Card title="Soil Inputs History" icon={<FileText size={20} />}>
          {inputs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">K</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">pH</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moisture</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inputs.map((input) => (
                    <tr key={input.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(input.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(input as any).location_display || (input as any).city || (input as any).state || (
                          <span className="flex items-center text-gray-400">
                            <MapPin size={14} className="mr-1" />
                            Not specified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.N_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.P_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.K_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.ph.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.moisture.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.temperature.toFixed(1)}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No history yet</p>
          )}
        </Card>

        <Card title="Crop Recommendations" icon={<Sprout size={20} />}>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary-700">{rec.crop_name}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{rec.explanation}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(rec.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="success">Recommended</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No recommendations yet</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default History;
