import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { contactAPI } from '../../services/api';

interface Inquiry {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    category: string;
    status: string;
    created_at: string;
    has_reply: boolean;
    replied_by: string | null;
    replied_at: string | null;
    admin_reply?: string;
}

interface Stats {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
}

const ContactInquiries: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, [statusFilter, categoryFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const filters: { status?: string; category?: string } = {};
            if (statusFilter) filters.status = statusFilter;
            if (categoryFilter) filters.category = categoryFilter;

            const data = await contactAPI.getList(filters);
            setInquiries(data.inquiries || []);
            setStats(data.stats || { total: 0, pending: 0, in_progress: 0, resolved: 0 });
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            setMessage({ type: 'error', text: 'Failed to load inquiries' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (inquiry: Inquiry) => {
        try {
            const details = await contactAPI.getDetail(inquiry.id);
            setSelectedInquiry(details);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load inquiry details' });
        }
    };

    const handleStatusChange = async (inquiryId: number, newStatus: string) => {
        try {
            await contactAPI.updateStatus(inquiryId, newStatus);
            setMessage({ type: 'success', text: 'Status updated successfully' });
            fetchData();
            if (selectedInquiry?.id === inquiryId) {
                setSelectedInquiry({ ...selectedInquiry, status: newStatus });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update status' });
        }
    };

    const handleOpenReply = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setReplyText('');
        setShowReplyModal(true);
    };

    const handleSendReply = async () => {
        if (!selectedInquiry || !replyText.trim()) return;

        setSending(true);
        try {
            await contactAPI.sendReply(selectedInquiry.id, replyText);
            setMessage({ type: 'success', text: `Reply sent successfully to ${selectedInquiry.email}` });
            setShowReplyModal(false);
            setReplyText('');
            setSelectedInquiry(null);
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send reply' });
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-MY', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: { [key: string]: string } = {
            'general': '💬 General',
            'technical': '🔧 Technical',
            'feedback': '💡 Feedback',
            'bug': '🐛 Bug Report',
            'feature': '✨ Feature',
            'other': '📝 Other',
        };
        return labels[category] || category;
    };

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-3xl">📬</span>
                        Contact Inquiries
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and respond to user inquiries and support requests
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-blue-100 text-sm">Total Inquiries</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-yellow-100 text-sm">Pending</p>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-indigo-100 text-sm">In Progress</p>
                        <p className="text-3xl font-bold">{stats.in_progress}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                        <p className="text-green-100 text-sm">Resolved</p>
                        <p className="text-3xl font-bold">{stats.resolved}</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-red-50 text-red-700 border border-red-300'}`}>
                        {message.text}
                        <button onClick={() => setMessage(null)} className="float-right font-bold">×</button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Categories</option>
                            <option value="general">General</option>
                            <option value="technical">Technical Support</option>
                            <option value="feedback">Feedback</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    /* Inquiries List */
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {inquiries.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-xl mb-2">📭</p>
                                <p>No inquiries found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {inquiries.map((inquiry) => (
                                            <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                                                        <p className="text-sm text-gray-500">{inquiry.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-gray-800 font-medium">{inquiry.subject}</p>
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">{inquiry.message}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm">{getCategoryLabel(inquiry.category)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <select
                                                        value={inquiry.status}
                                                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                                                        className={`px-2 py-1 rounded-lg text-sm font-medium ${getStatusColor(inquiry.status)} border-0 cursor-pointer`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500">
                                                    {formatDate(inquiry.created_at)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(inquiry)}
                                                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenReply(inquiry)}
                                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${inquiry.has_reply ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                        >
                                                            {inquiry.has_reply ? '✓ Replied' : '📧 Reply'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* View Details Modal */}
                {selectedInquiry && !showReplyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-white">Inquiry Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Name</label>
                                        <p className="font-medium">{selectedInquiry.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Email</label>
                                        <p className="font-medium text-blue-600">{selectedInquiry.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Phone</label>
                                        <p className="font-medium">{selectedInquiry.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Category</label>
                                        <p className="font-medium">{getCategoryLabel(selectedInquiry.category)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500">Subject</label>
                                    <p className="font-semibold text-lg">{selectedInquiry.subject}</p>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500">Message</label>
                                    <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                                        {selectedInquiry.message}
                                    </div>
                                </div>

                                {selectedInquiry.admin_reply && (
                                    <div className="border-t pt-4">
                                        <label className="text-sm text-green-600 font-medium">Admin Reply</label>
                                        <div className="bg-green-50 p-4 rounded-lg mt-1 border-l-4 border-green-500 whitespace-pre-wrap">
                                            {selectedInquiry.admin_reply}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Replied by {selectedInquiry.replied_by} on {selectedInquiry.replied_at && formatDate(selectedInquiry.replied_at)}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setSelectedInquiry(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    {!selectedInquiry.admin_reply && (
                                        <button
                                            onClick={() => { setShowReplyModal(true); setReplyText(''); }}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            📧 Send Reply
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reply Modal */}
                {showReplyModal && selectedInquiry && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
                            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-white">Reply to {selectedInquiry.name}</h2>
                                <p className="text-blue-100 text-sm mt-1">{selectedInquiry.email}</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-2">Original Message:</p>
                                    <p className="font-medium text-gray-800">"{selectedInquiry.subject}"</p>
                                    <p className="text-gray-600 text-sm mt-1">{selectedInquiry.message}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your response to the user..."
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => { setShowReplyModal(false); setSelectedInquiry(null); }}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={sending || !replyText.trim()}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>📧 Send Reply</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ContactInquiries;
