import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, Badge, StatCard } from '../../components/UI';
import { adminAPI } from '../../services/api';
import { Shield, AlertTriangle } from 'lucide-react';
import type { CyberLog } from '../../types';

const CyberLogs: React.FC = () => {
  const [logs, setLogs] = useState<CyberLog[]>([]);
  const [stats, setStats] = useState({ total_logs: 0, anomalies_detected: 0, anomaly_rate: 0 });
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, statsData] = await Promise.all([
          adminAPI.getCyberLogs(),
          adminAPI.getCyberLogStats(),
        ]);
        setLogs(logsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch cyber logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLogs = filter === 'anomalies' 
    ? logs.filter(log => log.anomaly_detected)
    : logs;

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
        <h1 className="text-3xl font-bold text-gray-900">Cybersecurity Logs</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Security Events"
            value={stats.total_logs}
            icon={<Shield size={24} />}
            color="blue"
          />
          <StatCard
            title="Anomalies Detected"
            value={stats.anomalies_detected}
            icon={<AlertTriangle size={24} />}
            color="red"
          />
          <StatCard
            title="Anomaly Rate"
            value={`${stats.anomaly_rate.toFixed(1)}%`}
            icon={<Shield size={24} />}
            color="yellow"
          />
        </div>

        <Card title="Security Event Logs" icon={<Shield size={20} />}>
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilter('anomalies')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'anomalies' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Anomalies Only
            </button>
          </div>

          {filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant={log.anomaly_detected ? 'warning' : 'success'}>
                          {log.integrity_status}
                        </Badge>
                        {log.user_username && (
                          <span className="text-sm text-gray-600">User: {log.user_username}</span>
                        )}
                        {log.anomaly_detected && (
                          <AlertTriangle className="text-yellow-600" size={18} />
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{log.details}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No logs found</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default CyberLogs;
