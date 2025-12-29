import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Home,
    FileText,
    History,
    MessageSquare,
    Users,
    Shield,
    Activity,
    LogOut,
    Menu,
    X,
    Cloud,
    User,
    MapPin,
    Bell,
    Mail
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const isAdmin = user?.role === 'ADMIN';

    const userNavItems = [
        { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/user/soil-input', icon: FileText, label: 'Soil Analysis' },
        { path: '/user/weather', icon: Cloud, label: 'Weather & Climate' },
        { path: '/user/market-linkage', icon: MapPin, label: 'Market Linkage' },
        { path: '/user/history', icon: History, label: 'History' },
        { path: '/user/feedback', icon: MessageSquare, label: 'Feedback' },
        { path: '/user/profile', icon: User, label: 'Profile' },
    ];

    const adminNavItems = [
        { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/soil-inputs', icon: FileText, label: 'Soil Inputs' },
        { path: '/admin/cyber-logs', icon: Shield, label: 'Cyber Logs' },
        { path: '/admin/admin-logs', icon: Activity, label: 'Admin Logs' },
        { path: '/admin/weather-alerts', icon: Bell, label: 'Weather Alerts' },
        { path: '/admin/contact-inquiries', icon: Mail, label: 'Contact Inquiries' },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <Link to="/" className="ml-2 text-xl font-bold text-primary-700 flex items-center hover:text-primary-600 transition-colors cursor-pointer">
                                🌾 SecureCrop
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-3">
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{user?.username}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isAdmin
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {user?.role}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className={`
          fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out mt-16 md:mt-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                                            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
