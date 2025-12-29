import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, Badge } from '../../components/UI';
import { adminAPI } from '../../services/api';
import { Users } from 'lucide-react';
import type { SoilInput } from '../../types';

const UserManagement: React.FC = () => {
  const [soilInputs, setSoilInputs] = useState<SoilInput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminAPI.getAllSoilInputs();
        setSoilInputs(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const users = Array.from(new Set(soilInputs.map(s => s.user_email))).map(email => {
    const userInputs = soilInputs.filter(s => s.user_email === email);
    return {
      email,
      username: userInputs[0]?.user_username || 'Unknown',
      totalInputs: userInputs.length,
      lastActivity: userInputs[0]?.created_at,
    };
  });

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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

        <Card title="All Users" icon={<Users size={20} />}>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Analyses</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.totalInputs}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">Active</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No users found</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default UserManagement;
