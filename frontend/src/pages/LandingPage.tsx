import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  CloudRain,
  TrendingUp,
  Shield,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Leaf,
  Sun,
  Droplets,
  BarChart3,
  Zap,
  Target,
  Activity,
  ShoppingCart
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['home', 'services', 'about'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-2 rounded-lg">
                <Sprout className="text-white" size={28} />
              </div>
              <span className={`text-2xl font-bold ${scrolled ? 'text-green-800' : 'text-white'
                }`}>
                SecureCrop
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className={`font-medium transition-all duration-300 relative group ${scrolled ? 'text-gray-700' : 'text-white'
                  } ${activeSection === 'home' ? 'text-green-600' : ''}`}
              >
                Home
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 ${activeSection === 'home' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
              </a>
              <Link
                to="/services"
                className={`font-medium transition-all duration-300 relative group ${scrolled ? 'text-gray-700' : 'text-white'
                  }`}
              >
                Services
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full`}></span>
              </Link>
              <Link
                to="/about"
                className={`font-medium transition-all duration-300 relative group ${scrolled ? 'text-gray-700' : 'text-white'
                  }`}
              >
                About Us
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full`}></span>
              </Link>
              <Link
                to="/contact"
                className={`font-medium transition-all duration-300 relative group ${scrolled ? 'text-gray-700' : 'text-white'
                  }`}
              >
                Contact Us
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full`}></span>
              </Link>
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
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'
                }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">Home</a>
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">Services</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">Contact Us</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-center bg-green-600 text-white rounded-lg">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-center border-2 border-green-600 text-green-600 rounded-lg">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden">
        {/* Background with gradient and animated elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700">
          <div className="absolute inset-0 bg-black opacity-40"></div>

          {/* Animated floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-15 animate-float-delayed"></div>
            <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Enhanced with stagger animations */}
            <div className="text-white space-y-8">
              <div
                className="inline-flex items-center space-x-2 bg-green-700 bg-opacity-50 px-4 py-2 rounded-full backdrop-blur-sm animate-fadeInDown hover:scale-105 transition-transform duration-300 cursor-pointer"
                style={{ animationDelay: '0.1s' }}
              >
                <Award className="text-yellow-400 animate-bounce-slow" size={20} />
                <span className="text-sm font-medium">AI-Powered Agriculture Platform</span>
              </div>

              <h1
                className="text-5xl md:text-6xl font-bold leading-tight animate-fadeInLeft"
                style={{ animationDelay: '0.2s' }}
              >
                Empowering Farmers with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-yellow-300 to-green-400 animate-gradient-shift">
                  Smart Technology
                </span>
              </h1>

              <p
                className="text-xl text-gray-200 leading-relaxed animate-fadeInLeft"
                style={{ animationDelay: '0.3s' }}
              >
                Make data-driven decisions with our advanced AI system. Get real-time soil analysis,
                weather forecasts, and personalized crop recommendations to maximize your harvest.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fadeInLeft"
                style={{ animationDelay: '0.4s' }}
              >
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-white text-green-800 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 flex items-center justify-center space-x-2 hover:scale-105 transform"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" size={20} />
                </Link>
                <a
                  href="#services"
                  className="group px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-green-800 transition-all duration-300 flex items-center justify-center hover:scale-105 transform"
                >
                  Learn More
                </a>
              </div>

              {/* Stats - Enhanced with hover effects */}
              <div
                className="grid grid-cols-3 gap-6 pt-8 animate-fadeInUp"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">1000+</div>
                  <div className="text-sm text-gray-300">Active Farmers</div>
                </div>
                <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">95%</div>
                  <div className="text-sm text-gray-300">Accuracy Rate</div>
                </div>
                <div className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">24/7</div>
                  <div className="text-sm text-gray-300">Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - Enhanced Animated Illustration */}
            <div
              className="relative animate-fadeInRight"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative z-10">
                {/* Floating Cards Animation */}
                <div className="relative">
                  {/* Main Card with hover effect */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4 hover-lift cursor-pointer transform hover:scale-105 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">Today's Farm Status</h3>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse-glow">
                        Optimal
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Droplets className="text-blue-600 animate-bounce-slow" size={20} />
                          <span className="text-sm text-gray-600">Soil Moisture</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">68%</div>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sun className="text-yellow-600 animate-pulse" size={20} />
                          <span className="text-sm text-gray-600">Temperature</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 hover:text-yellow-700 transition-colors">28°C</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-green-600" size={20} />
                        <span className="text-sm text-gray-600">Crop Health Score</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-green-600">92/100</div>
                        <div className="text-sm text-green-700 font-medium">Excellent</div>
                      </div>
                      <div className="mt-2 bg-green-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: '92%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Weather Card - Enhanced */}
                  <div className="absolute -right-4 -top-4 bg-white rounded-xl shadow-xl p-4 animate-float hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <CloudRain className="text-blue-500 animate-bounce-slow" size={24} />
                      <div>
                        <div className="text-xs text-gray-500">Weather Alert</div>
                        <div className="text-sm font-semibold text-gray-800">Rain Expected</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Leaf Icon - Enhanced */}
                  <div className="absolute -left-6 top-1/2 bg-green-500 p-3 rounded-full shadow-lg animate-bounce-slow hover:rotate-12 transition-transform duration-300 cursor-pointer">
                    <Leaf className="text-white" size={24} />
                  </div>

                  {/* Animated Progress Ring */}
                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full shadow-xl animate-float-delayed hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <BarChart3 className="text-white" size={28} />
                  </div>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 right-10 w-32 h-32 bg-green-300 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions designed specifically for modern farmers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Service 1 */}
            <div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-green-500 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: '0.1s' }}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-green-500/50">
                  <Sprout className="text-white group-hover:scale-110 transition-transform" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Soil Analysis</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                  AI-powered soil testing with instant results. Get detailed nutrient analysis and pH levels.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                    <CheckCircle className="text-green-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    NPK Analysis
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <CheckCircle className="text-green-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    pH Testing
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.15s' }}>
                    <CheckCircle className="text-green-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Instant Results
                  </li>
                </ul>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-green-500 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500"></div>
            </div>

            {/* Service 2 */}
            <div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-blue-500 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/50">
                  <CloudRain className="text-white group-hover:scale-110 transition-transform" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Weather Forecasts</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                  Real-time weather updates and 7-day forecasts tailored to your farm location.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                    <CheckCircle className="text-blue-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Live Updates
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <CheckCircle className="text-blue-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Email Alerts
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.15s' }}>
                    <CheckCircle className="text-blue-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Risk Assessment
                  </li>
                </ul>
              </div>

              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500"></div>
            </div>

            {/* Service 3 */}
            <div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-yellow-500 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-yellow-500/50">
                  <TrendingUp className="text-white group-hover:scale-110 transition-transform" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">Crop Recommendations</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                  Data-driven suggestions for optimal crop selection and farming practices.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                    <CheckCircle className="text-yellow-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Best Crops
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <CheckCircle className="text-yellow-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Yield Prediction
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.15s' }}>
                    <CheckCircle className="text-yellow-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Season Planning
                  </li>
                </ul>
              </div>

              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500"></div>
            </div>

            {/* Service 4 */}
            <div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-purple-500 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/50">
                  <Shield className="text-white group-hover:scale-110 transition-transform" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Cyber Security</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                  Advanced threat detection to protect your farm data and operations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                    <CheckCircle className="text-purple-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Data Protection
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <CheckCircle className="text-purple-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Anomaly Detection
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.15s' }}>
                    <CheckCircle className="text-purple-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    24/7 Monitoring
                  </li>
                </ul>
              </div>

              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500"></div>
            </div>

            {/* Service 5 - Market Linkage */}
            <div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-orange-500 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-orange-500/50">
                  <ShoppingCart className="text-white group-hover:scale-110 transition-transform" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Market Linkage</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                  Connect directly with buyers and access real-time market prices for your crops.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                    <CheckCircle className="text-orange-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Direct Buyer Access
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                    <CheckCircle className="text-orange-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Real-time Pricing
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.15s' }}>
                    <CheckCircle className="text-orange-500 mr-2 group-hover:scale-110 transition-transform" size={16} />
                    Quality Assurance
                  </li>
                </ul>
              </div>

              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-500 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 animate-fadeInLeft">
                Why Choose SecureCrop?
              </h2>
              <p className="text-xl text-gray-600 animate-fadeInLeft" style={{ animationDelay: '0.1s' }}>
                We combine cutting-edge AI technology with deep agricultural expertise to deliver results that matter.
              </p>

              <div className="space-y-6">
                <div
                  className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-x-2 animate-fadeInLeft"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="bg-green-600 rounded-lg p-3 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-green-500/50">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Data-Driven Insights</h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Make informed decisions with our AI-powered analytics and predictive models.
                    </p>
                  </div>
                </div>

                <div
                  className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-x-2 animate-fadeInLeft"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="bg-blue-600 rounded-lg p-3 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/50">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Expert Support</h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Access to agricultural experts and 24/7 customer support whenever you need it.
                    </p>
                  </div>
                </div>

                <div
                  className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-x-2 animate-fadeInLeft"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="bg-yellow-600 rounded-lg p-3 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-yellow-500/50">
                    <Award className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">Proven Results</h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      Join thousands of farmers who've increased their yield by an average of 30%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-fadeInRight">
              <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop"
                  alt="Farmer using technology"
                  className="rounded-xl w-full h-64 object-cover mb-6 hover:scale-105 transition-transform duration-500"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="font-semibold text-gray-800">Crop Yield Increase</span>
                    <span className="text-2xl font-bold text-green-600">+30%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-gray-800">Cost Reduction</span>
                    <span className="text-2xl font-bold text-blue-600">-25%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <span className="font-semibold text-gray-800">Time Saved</span>
                    <span className="text-2xl font-bold text-yellow-600">40hrs/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About SecureCrop
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to revolutionize agriculture through technology and empower farmers worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group text-center p-8 rounded-2xl hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/50">
                <Sprout className="text-green-600 group-hover:scale-110 transition-transform" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Our Mission</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                To make advanced agricultural technology accessible to every farmer, regardless of farm size.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                <TrendingUp className="text-blue-600 group-hover:scale-110 transition-transform" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Our Vision</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                A world where every farmer has the tools and knowledge to achieve sustainable, profitable farming.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-500/50">
                <Award className="text-yellow-600 group-hover:scale-110 transition-transform" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">Our Values</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                Innovation, sustainability, and farmer-first approach in everything we do.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-12 text-center text-white relative overflow-hidden group animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl animate-float"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl animate-float-delayed"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300">Join Our Growing Community</h3>
              <p className="text-xl mb-8 text-green-100">
                Start your journey towards smarter, more profitable farming today
              </p>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-green-800 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95"
              >
                <span>Get Started Now</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                <a href="https://www.facebook.com/parvej.rafi.985817" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition">
                  <Twitter size={20} />
                </a>
                <a href="https://www.instagram.com/parvejrafi01/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition">
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
                <li className="text-gray-400">Cyber Security</li>
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

      {/* Custom CSS for advanced animations and micro-interactions */}
      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.8);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(1.1);
          }
          20%, 40% {
            transform: scale(1.05);
          }
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
          opacity: 0;
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

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #16a34a, #166534);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #15803d, #14532d);
        }

        /* Hover lift effect for cards */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        /* Gradient text animation */
        .gradient-text {
          background-size: 200% auto;
          animation: gradient-shift 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
