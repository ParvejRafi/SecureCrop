import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card } from '../../components/UI';
import { adminAPI } from '../../services/api';
import { FileText } from 'lucide-react';
import type { SoilInput } from '../../types';

const SoilInputManagement: React.FC = () => {
  const [inputs, setInputs] = useState<SoilInput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminAPI.getAllSoilInputs();
        setInputs(data);
      } catch (error) {
        console.error('Failed to fetch soil inputs:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Soil Input Management</h1>

        <Card title="All Soil Inputs" icon={<FileText size={20} />}>
          {inputs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">K</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">pH</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moisture</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integrity Hash</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inputs.map((input) => (
                    <tr key={input.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{input.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.user_username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.N_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.P_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.K_level.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.ph.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.moisture.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{input.temperature.toFixed(1)}°C</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {input.integrity_hash ? (
                          <span className="text-green-600" title={input.integrity_hash}>
                            {input.integrity_hash.substring(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(input.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No soil inputs found</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default SoilInputManagement;
