import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card } from '../../components/UI';
import { adminAPI } from '../../services/api';
import { Activity } from 'lucide-react';
import type { AdminLog } from '../../types';

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminAPI.getAdminLogs();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch admin logs:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Activity Logs</h1>

        <Card title="Administrative Actions" icon={<Activity size={20} />}>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">{log.admin_username}</span>
                        <span className="text-xs text-gray-500">{log.admin_email}</span>
                      </div>
                      <p className="text-sm text-gray-800">{log.action}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No admin logs found</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLogs;
