import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sprout,
  Target,
  Eye,
  Award,
  Users,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Code,
  Brain,
  Shield,
  Server
} from 'lucide-react';

const AboutUs: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teamMembers = [
    {
      name: 'Parvej Rafi',
      role: 'Team Lead & Backend Developer',
      description: 'Orchestrating the technical vision and building robust backend infrastructure for scalable agricultural solutions.',
      skills: ['Django', 'Python', 'System Architecture', 'API Development'],
      icon: Server,
      image: '/images/team/amrpic.png',
      gradient: 'from-emerald-600 to-green-700',
      social: {
        linkedin: 'https://www.linkedin.com/in/parvej-rafi-ba43a3301/',
        github: 'https://github.com/ParvejRafi',
        email: 'mdparvej.ahmedrafi@student.aiu.edu.my'
      }
    },
    {
      name: 'Altaf Hossain Sunny',
      role: 'ML Engineer & Frontend Developer',
      description: 'Crafting intelligent machine learning models and building intuitive user experiences for farmers.',
      skills: ['Machine Learning', 'React', 'TypeScript', 'Data Science'],
      icon: Brain,
      image: '/images/team/sani.png',
      gradient: 'from-blue-600 to-cyan-700',
      social: {
        linkedin: '#',
        github: '#',
        email: 'sani.rahman@securecrop.com'
      }
    },
    {
      name: 'Omid Qazikhil',
      role: 'Cybersecurity & Testing Specialist',
      description: 'Ensuring data security and system reliability through comprehensive testing and advanced security protocols.',
      skills: ['Security Testing', 'Penetration Testing', 'QA Automation', 'Risk Assessment'],
      icon: Shield,
      image: '/images/team/omid.jpg',
      gradient: 'from-teal-600 to-emerald-700',
      social: {
        linkedin: '#',
        github: '#',
        email: 'omid.qazikhil@securecrop.com'
      }
    }
  ];

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
                className="font-medium text-gray-700 hover:text-green-600 transition-all duration-300 relative group"
              >
                Services
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full"></span>
              </Link>
              <Link
                to="/about"
                className="font-medium text-green-600 relative"
              >
                About Us
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 w-full"></span>
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
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">Services</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-green-600 font-semibold">About Us</Link>
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
      <section className="relative pt-32 pb-20 overflow-hidden">
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
            <Users className="text-green-200" size={20} />
            <span className="text-sm font-medium text-white">Meet the Team Behind SecureCrop</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp leading-tight">
            About <span className="text-green-200">SecureCrop</span>
          </h1>

          <p className="text-xl text-green-50 max-w-3xl mx-auto mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Revolutionizing agriculture through AI-powered technology and empowering farmers with intelligent solutions for sustainable farming.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 group border-t-4 border-green-600">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="text-white" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 ml-4">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                To make advanced agricultural technology accessible to every farmer, regardless of farm size or location. We're committed to bridging the digital divide in farming by providing intelligent, data-driven insights that empower farmers to make informed decisions.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Through cutting-edge AI and machine learning, we aim to optimize crop yields, reduce environmental impact, and ensure food security for future generations while making farming more profitable and sustainable.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 group border-t-4 border-blue-600">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-700 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Eye className="text-white" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 ml-4">Our Vision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                To create a world where every farmer has access to intelligent tools and knowledge needed to achieve sustainable, profitable farming. We envision a future where technology and agriculture work in harmony to feed the world.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                We see SecureCrop becoming the global standard for smart agriculture, transforming traditional farming practices into precision agriculture through innovation, accessibility, and farmer-first approach.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">Pioneering new solutions for age-old farming challenges</p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Farmer-First</h3>
                <p className="text-gray-600">Every decision prioritizes farmer needs and success</p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sprout className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability</h3>
                <p className="text-gray-600">Environmental responsibility in every solution</p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-emerald-600 to-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600">Protecting farmer data with advanced cybersecurity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate technologists dedicated to transforming agriculture through innovation and expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => {
              const Icon = member.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border-t-4 border-transparent hover:border-green-600"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Profile Header with Gradient */}
                  <div className={`bg-gradient-to-br ${member.gradient} p-8 text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative z-10">
                      {/* Team Member Photo */}
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-white">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image not found
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-white/20 backdrop-blur-sm">
                          <Icon className="text-white" size={64} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                      <p className="text-green-100 font-medium text-sm uppercase tracking-wide">{member.role}</p>
                    </div>
                  </div>

                  {/* Profile Body */}
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {member.description}
                    </p>

                    {/* Skills */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Code className="h-4 w-4 mr-2 text-green-600" />
                        Key Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
                      <a
                        href={member.social.linkedin}
                        className="bg-gray-100 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 group/icon"
                      >
                        <Linkedin size={20} />
                      </a>
                      <a
                        href={member.social.github}
                        className="bg-gray-100 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 group/icon"
                      >
                        <Github size={20} />
                      </a>
                      <a
                        href={`mailto:${member.social.email}`}
                        className="bg-gray-100 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 group/icon"
                      >
                        <Mail size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl opacity-15 animate-float-delayed"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join thousands of farmers already using SecureCrop to optimize their farming operations and increase yields.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-800 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white hover:text-green-800 transition-all shadow-xl hover:scale-105"
            >
              Explore Services
            </Link>
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

export default AboutUs;
