import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Services from './pages/Services';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/user/Dashboard';
import SoilInput from './pages/user/SoilInput';
import History from './pages/user/History';
import UserFeedback from './pages/user/Feedback';
import Profile from './pages/user/Profile';
import { WeatherDashboard } from './pages/weather/WeatherDashboard';
import MarketLinkage from './pages/MarketLinkage';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SoilInputManagement from './pages/admin/SoilInputManagement';
import CyberLogs from './pages/admin/CyberLogs';
import AdminLogs from './pages/admin/AdminLogs';
import WeatherAlerts from './pages/admin/WeatherAlerts';
import ContactInquiries from './pages/admin/ContactInquiries';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User Routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/soil-input" element={<ProtectedRoute><SoilInput /></ProtectedRoute>} />
          <Route path="/user/weather" element={<ProtectedRoute><WeatherDashboard /></ProtectedRoute>} />
          <Route path="/user/market-linkage" element={<ProtectedRoute><MarketLinkage /></ProtectedRoute>} />
          <Route path="/user/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/user/feedback" element={<ProtectedRoute><UserFeedback /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/soil-inputs" element={<ProtectedRoute adminOnly><SoilInputManagement /></ProtectedRoute>} />
          <Route path="/admin/cyber-logs" element={<ProtectedRoute adminOnly><CyberLogs /></ProtectedRoute>} />
          <Route path="/admin/admin-logs" element={<ProtectedRoute adminOnly><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/weather-alerts" element={<ProtectedRoute adminOnly><WeatherAlerts /></ProtectedRoute>} />
          <Route path="/admin/contact-inquiries" element={<ProtectedRoute adminOnly><ContactInquiries /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

