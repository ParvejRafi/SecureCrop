import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatCard, Card } from '../../components/UI';
import { adminAPI, feedbackAPI } from '../../services/api';
import { Users, FileText, Shield, Star } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInputs: 0,
    totalAnomalies: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [soilInputs, cyberStats, feedbackStats] = await Promise.all([
          adminAPI.getAllSoilInputs(),
          adminAPI.getCyberLogStats(),
          feedbackAPI.getFeedbackStats(),
        ]);

        setStats({
          totalUsers: new Set(soilInputs.map(s => s.user)).size,
          totalInputs: soilInputs.length,
          totalAnomalies: cyberStats.anomalies_detected,
          averageRating: feedbackStats.average_rating || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System overview and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users size={24} />}
            color="blue"
          />
          <StatCard
            title="Soil Analyses"
            value={stats.totalInputs}
            icon={<FileText size={24} />}
            color="green"
          />
          <StatCard
            title="Anomalies Detected"
            value={stats.totalAnomalies}
            icon={<Shield size={24} />}
            color="red"
          />
          <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            icon={<Star size={24} />}
            color="yellow"
          />
        </div>

        <Card title="System Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">ML Model</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Cybersecurity Layer</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Database</span>
              <span className="text-green-600">Connected</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
