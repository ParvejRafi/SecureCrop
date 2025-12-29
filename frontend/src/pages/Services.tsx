import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FlaskConical,
  CloudRain,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Sprout,
  Shield,
  Lock,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

interface Service {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  dashboardRoute: string;
  gradient: string;
  ctaLabel: string;
}

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services: Service[] = [
    {
      id: 'soil-analysis',
      icon: FlaskConical,
      title: 'Soil Analysis',
      description: 'Get detailed insights into your soil composition and health with our advanced AI-powered analysis system.',
      features: [
        'NPK levels analysis',
        'pH balance measurement',
        'Moisture content detection',
        'AI-powered recommendations',
        'Historical tracking'
      ],
      dashboardRoute: '/user/soil-input',
      gradient: 'from-emerald-700 via-emerald-600 to-lime-500',
      ctaLabel: 'Launch Soil Lab'
    },
    {
      id: 'weather-forecast',
      icon: CloudRain,
      title: 'Weather Forecast',
      description: 'Access real-time weather data and forecasts tailored to your farm location with WhatsApp alerts.',
      features: [
        'Real-time weather updates',
        '7-day forecast',
        'Rainfall predictions',
        'WhatsApp weather alerts',
        'Location-based insights'
      ],
      dashboardRoute: '/user/weather',
      gradient: 'from-sky-600 via-cyan-600 to-emerald-500',
      ctaLabel: 'Open Weather Center'
    },
    {
      id: 'market-linkage',
      icon: ShoppingCart,
      title: 'Market Linkage',
      description: 'Connect with nearby markets and buyers using our GPS-based market finder system.',
      features: [
        'GPS-based market finder',
        'Live market prices',
        'Direct buyer connections',
        'Distance calculator',
        'Market reviews & ratings'
      ],
      dashboardRoute: '/user/market-linkage',
      gradient: 'from-green-600 via-emerald-600 to-emerald-500',
      ctaLabel: 'Enter Market Hub'
    },
    {
      id: 'crop-recommendations',
      icon: Sprout,
      title: 'Crop Recommendations',
      description: 'Get AI-driven crop recommendations based on your soil conditions and weather patterns.',
      features: [
        'ML-based crop suggestions',
        'Soil compatibility analysis',
        'Seasonal recommendations',
        'Yield predictions',
        'Risk assessment'
      ],
      dashboardRoute: '/user/dashboard',
      gradient: 'from-lime-500 via-green-500 to-emerald-600',
      ctaLabel: 'View Crop Strategy'
    },
    {
      id: 'cyber-security',
      icon: Shield,
      title: 'Cyber Security',
      description: 'Your data is protected with advanced anomaly detection and security monitoring systems.',
      features: [
        'Real-time threat detection',
        'Anomaly monitoring',
        'Data encryption',
        'Secure authentication',
        'Activity logging'
      ],
      dashboardRoute: '/user/dashboard',
      gradient: 'from-emerald-700 via-green-700 to-slate-800',
      ctaLabel: 'Launch Security Center'
    }
  ];

  const handleServiceClick = (service: Service) => {
    if (isAuthenticated) {
      // User is authenticated, navigate directly to the service
      navigate(service.dashboardRoute);
    } else {
      // User is not authenticated, redirect to login with return URL
      navigate('/login', {
        state: {
          returnTo: service.dashboardRoute,
          serviceName: service.title
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Sprout className="text-white" size={28} />
              </div>
              <span className="text-2xl font-bold text-green-800">
                SecureCrop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="font-medium text-gray-700 hover:text-green-600 transition-all duration-300 relative group"
              >
                Home
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full"></span>
              </Link>
              <Link
                to="/services"
                className="font-medium text-green-600 relative"
              >
                Services
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 w-full"></span>
              </Link>
              <Link
                to="/about"
                className="font-medium text-gray-700 hover:text-green-600 transition-all duration-300 relative group"
              >
                About Us
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full"></span>
              </Link>
              <Link
                to="/contact"
                className="font-medium text-gray-700 hover:text-green-600 transition-all duration-300 relative group"
              >
                Contact Us
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full"></span>
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/user/dashboard"
                  className="px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 rounded-lg font-medium text-green-600 bg-white hover:bg-gray-50 transition-all duration-300 border-2 border-green-600 hover:scale-105 transform"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">Home</Link>
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-green-600 font-semibold">Services</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">Contact Us</Link>
              {isAuthenticated ? (
                <Link to="/user/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-center bg-green-600 text-white rounded-lg">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-center bg-green-600 text-white rounded-lg">Login</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-center border-2 border-green-600 text-green-600 rounded-lg">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background with gradient and animated elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-700">
          <div className="absolute inset-0 bg-black opacity-30"></div>

          {/* Animated floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl opacity-15 animate-float-delayed"></div>
            <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-teal-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          </div>

          {/* Animated grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-700 bg-opacity-50 px-4 py-2 rounded-full mb-6 backdrop-blur-sm animate-fadeInDown">
            <Shield className="text-green-200" size={20} />
            <span className="text-sm font-medium text-white">Comprehensive Agricultural Solutions</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp leading-tight">
            Our Professional <span className="text-green-200">Services</span>
          </h1>

          <p className="text-xl text-green-50 max-w-3xl mx-auto mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            {isAuthenticated
              ? 'Access all our advanced features to optimize your farming operations'
              : 'Discover our comprehensive suite of AI-powered agricultural services. Login to get started!'}
          </p>

          {!isAuthenticated && (
            <div className="inline-flex items-center space-x-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <Lock size={16} className="text-green-200" />
              <span className="text-white">Authentication required to access services</span>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Service Header */}
                  <div className={`bg-gradient-to-r ${service.gradient} p-6 group-hover:scale-[1.02] transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {service.description}
                    </p>
                  </div>

                  {/* Service Features */}
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Key Features
                    </h4>
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      onClick={() => handleServiceClick(service)}
                      className={`w-full bg-gradient-to-r ${service.gradient} text-white py-3 px-6 rounded-xl font-semibold 
                      hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 
                      flex items-center justify-center group relative`}
                    >
                      {!isAuthenticated && (
                        <Lock className="mr-2 h-5 w-5" />
                      )}
                      {isAuthenticated ? service.ctaLabel : 'Login to Access'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-lg">
                  <Sprout className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold">SecureCrop</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering farmers with AI-powered insights for sustainable and profitable agriculture.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition">
                  <Twitter size={20} />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition">
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-green-400 transition">Home</Link></li>
                <li><Link to="/services" className="text-gray-400 hover:text-green-400 transition">Services</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-green-400 transition">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-green-400 transition">Contact Us</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-green-400 transition">Login</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Soil Analysis</li>
                <li className="text-gray-400">Weather Forecasts</li>
                <li className="text-gray-400">Crop Recommendations</li>
                <li className="text-gray-400">Market Linkage</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2 text-gray-400">
                  <Phone size={18} />
                  <span>+60 17-612 7213</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <Mail size={18} />
                  <span>mdparvej.ahmedrafi@student.aiu.edu.my</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <MapPin size={18} />
                  <span>Al-Bukhary International University, Alor Setar, Kedah</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 SecureCrop. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-400 transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(-10px) translateX(-10px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(15px) translateX(-15px) scale(1.05);
          }
          66% {
            transform: translateY(-15px) translateX(15px) scale(0.95);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Services;
