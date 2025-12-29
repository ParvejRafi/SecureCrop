import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { notificationsAPI } from '../../services/api';

interface User {
    id: number;
    username: string;
    email: string;
    location_lat: number | null;
    location_lon: number | null;
    weather_preview: {
        temperature: number;
        description: string;
        city: string;
    } | null;
}

interface Stats {
    users: {
        total_farmers: number;
        email_alerts_enabled: number;
        eligible_for_weather_alerts: number;
        need_to_set_location: number;
    };
    alerts: {
        total_sent: number;
        total_emails_delivered: number;
        total_emails_failed: number;
    };
}

interface AlertHistory {
    id: number;
    title: string;
    message: string;
    created_by: string;
    created_at: string;
    emails_sent_count: number;
    target_all_users: boolean;
}

const WeatherAlerts: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
    const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
    const [usersWithoutLocation, setUsersWithoutLocation] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            const [statsRes, usersRes, historyRes] = await Promise.all([
                notificationsAPI.getStats(),
                notificationsAPI.getEligibleUsers(),
                notificationsAPI.getHistory()
            ]);
            setStats(statsRes);
            setEligibleUsers(usersRes.eligible_users?.users || []);
            setUsersWithoutLocation(usersRes.users_without_location?.count || 0);
            setAlertHistory(historyRes.alerts || []);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            setErrorMessage(error.response?.data?.detail || 'Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendToAll = async () => {
        if (eligibleUsers.length === 0) {
            setErrorMessage('No eligible farmers to send alerts to');
            return;
        }
        if (!window.confirm(`Send weather alerts to all ${eligibleUsers.length} eligible farmers?`)) return;

        try {
            setSending(true);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await notificationsAPI.sendAlerts(true);
            setSuccessMessage(`✅ ${response.message}`);
            fetchData();
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to send alerts');
        } finally {
            setSending(false);
        }
    };

    const handleSendToSelected = async () => {
        if (selectedUsers.length === 0) {
            setErrorMessage('Please select at least one user');
            return;
        }
        if (!window.confirm(`Send weather alerts to ${selectedUsers.length} selected farmers?`)) return;

        try {
            setSending(true);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await notificationsAPI.sendAlerts(false, selectedUsers);
            setSuccessMessage(`✅ ${response.message}`);
            setSelectedUsers([]);
            fetchData();
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to send alerts');
        } finally {
            setSending(false);
        }
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const selectAllUsers = () => {
        setSelectedUsers(prev => prev.length === eligibleUsers.length ? [] : eligibleUsers.map(u => u.id));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-MY', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-3xl">🌤️</span>
                        Weather Alert Center
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Send personalized weather alerts to farmers based on their location
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-green-100 text-sm">Eligible Farmers</p>
                        <p className="text-3xl font-bold">{stats?.users.eligible_for_weather_alerts || 0}</p>
                        <p className="text-green-200 text-xs mt-1">With location & alerts enabled</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-blue-100 text-sm">Email Alerts Enabled</p>
                        <p className="text-3xl font-bold">{stats?.users.email_alerts_enabled || 0}</p>
                        <p className="text-blue-200 text-xs mt-1">Total subscribers</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-purple-100 text-sm">Alerts Sent</p>
                        <p className="text-3xl font-bold">{stats?.alerts.total_sent || 0}</p>
                        <p className="text-purple-200 text-xs mt-1">Total campaigns</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-orange-100 text-sm">Emails Delivered</p>
                        <p className="text-3xl font-bold">{stats?.alerts.total_emails_delivered || 0}</p>
                        <p className="text-orange-200 text-xs mt-1">Successfully sent</p>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {errorMessage}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('send')}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'send'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                📤 Send Alerts
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'history'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                📋 Alert History
                            </button>
                        </div>

                        {/* Send Alerts Tab */}
                        {activeTab === 'send' && (
                            <div className="space-y-6">
                                {/* Quick Send */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        ⚡ Quick Send
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        Send personalized weather alerts to farmers. Each farmer receives weather data
                                        specific to their saved location with relevant warnings and tips.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={handleSendToAll}
                                            disabled={sending || eligibleUsers.length === 0}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${sending || eligibleUsers.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                                }`}
                                        >
                                            {sending ? '⏳ Sending...' : `🌍 Send to All (${eligibleUsers.length} farmers)`}
                                        </button>
                                        <button
                                            onClick={handleSendToSelected}
                                            disabled={sending || selectedUsers.length === 0}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${sending || selectedUsers.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                                }`}
                                        >
                                            👤 Send to Selected ({selectedUsers.length})
                                        </button>
                                    </div>
                                    {usersWithoutLocation > 0 && (
                                        <p className="text-yellow-600 text-sm mt-4">
                                            ⚠️ {usersWithoutLocation} users have alerts enabled but haven't set their location yet.
                                        </p>
                                    )}
                                </div>

                                {/* Eligible Users */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            👥 Eligible Farmers
                                        </h2>
                                        {eligibleUsers.length > 0 && (
                                            <button
                                                onClick={selectAllUsers}
                                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                                            >
                                                {selectedUsers.length === eligibleUsers.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        )}
                                    </div>

                                    {eligibleUsers.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">No eligible farmers found.</p>
                                            <p className="text-gray-400 text-sm mt-2">
                                                Farmers need to enable email alerts and set their location in profile settings.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                            {eligibleUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => toggleUserSelection(user.id)}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedUsers.includes(user.id)
                                                            ? 'bg-green-50 border-green-500'
                                                            : 'bg-gray-50 border-transparent hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-gray-800 font-medium">{user.username}</p>
                                                            <p className="text-gray-500 text-sm truncate">{user.email}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedUsers.includes(user.id)
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'border-gray-400'
                                                            }`}>
                                                            {selectedUsers.includes(user.id) && <span className="text-xs">✓</span>}
                                                        </div>
                                                    </div>
                                                    {user.weather_preview && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                            <p className="text-blue-600 text-sm">📍 {user.weather_preview.city}</p>
                                                            <p className="text-gray-600 text-sm">
                                                                🌡️ {user.weather_preview.temperature}°C - {user.weather_preview.description}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* History Tab */}
                        {activeTab === 'history' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Alert History</h2>
                                {alertHistory.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No alerts sent yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {alertHistory.map(alert => (
                                            <div key={alert.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-gray-800 font-medium">{alert.title}</h3>
                                                        <p className="text-gray-500 text-sm mt-1">{alert.message}</p>
                                                    </div>
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        {alert.emails_sent_count} sent
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
                                                    <span>👤 {alert.created_by}</span>
                                                    <span>📅 {formatDate(alert.created_at)}</span>
                                                    <span>{alert.target_all_users ? '🌍 All Users' : '👥 Selected'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default WeatherAlerts;
