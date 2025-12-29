import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sprout,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  HeadphonesIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ContactUs: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact/inquiries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting inquiry:', errorData);
        setSubmitStatus('error');
        return;
      }

      const data = await response.json();
      console.log('Inquiry submitted successfully:', data);
      setSubmitStatus('success');

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        });
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
    }
  };

  const contactCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Subscription' },
    { value: 'partnership', label: 'Partnership Opportunities' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Support',
      primary: '+880 123 456 7890',
      secondary: '+880 987 654 3210',
      description: 'Available Mon-Sat, 9 AM - 6 PM',
      gradient: 'from-green-600 to-emerald-700'
    },
    {
      icon: Mail,
      title: 'Email Support',
      primary: 'support@securecrop.com',
      secondary: 'info@securecrop.com',
      description: 'We respond within 24 hours',
      gradient: 'from-blue-600 to-cyan-700'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      primary: 'Dhaka, Bangladesh',
      secondary: 'Mohakhali, Dhaka - 1212',
      description: 'Visit us during business hours',
      gradient: 'from-teal-600 to-emerald-700'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with SecureCrop?',
      answer: 'Simply register for a free account, complete your farm profile, and start accessing our AI-powered agricultural services including soil analysis, weather forecasts, and crop recommendations.'
    },
    {
      question: 'What services are included in the platform?',
      answer: 'We offer soil analysis, real-time weather forecasting, market linkage, crop recommendations, analytics dashboard, AI insights, cybersecurity protection, and dedicated farmer support.'
    },
    {
      question: 'Is there technical support for farmers?',
      answer: 'Yes! We provide comprehensive technical support via phone and email. Our team is dedicated to helping farmers make the most of our platform.'
    },
    {
      question: 'How accurate is the weather prediction?',
      answer: 'Our weather forecasting system uses advanced meteorological data and AI algorithms to provide highly accurate 7-day forecasts specific to your farm location.'
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
                className="font-medium text-gray-700 hover:text-green-600 transition-all duration-300 relative group"
              >
                About Us
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 w-0 group-hover:w-full"></span>
              </Link>
              <Link
                to="/contact"
                className="font-medium text-green-600 relative"
              >
                Contact Us
                <span className="absolute -bottom-1 left-0 h-0.5 bg-green-600 w-full"></span>
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
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-green-600">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-green-600 font-semibold">Contact Us</Link>
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
            <MessageSquare className="text-green-200" size={20} />
            <span className="text-sm font-medium text-white">We're Here to Help</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp leading-tight">
            Get in <span className="text-green-200">Touch</span>
          </h1>

          <p className="text-xl text-green-50 max-w-3xl mx-auto mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Have questions? Need support? Want to partner with us? Our team is ready to assist you with all your agricultural technology needs.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Form and Map */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <CheckCircle className="text-green-600 mr-3" size={24} />
                  <div>
                    <p className="text-green-800 font-semibold">Message Sent Successfully!</p>
                    <p className="text-green-600 text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="+880 123 456 7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      {contactCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitStatus === 'success'}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="mr-2" size={20} />
                  {submitStatus === 'success' ? 'Message Sent!' : 'Send Message'}
                </button>

                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-600 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-bold text-green-900">Message Sent Successfully!</h4>
                        <p className="text-green-700 text-sm mt-1">
                          Thank you for contacting us. We'll get back to you via email within 24-48 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-bold text-red-900">Submission Failed</h4>
                        <p className="text-red-700 text-sm mt-1">
                          There was an error submitting your message. Please try again or contact us directly via email.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-green-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="mr-3 text-green-600" size={28} />
                  Business Hours
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Monday - Friday</span>
                    <span className="text-green-600 font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Saturday</span>
                    <span className="text-green-600 font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Sunday</span>
                    <span className="text-gray-400 font-semibold">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect With Us</h3>
                <p className="text-gray-600 mb-6">
                  Follow us on social media for updates, farming tips, and community discussions.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg text-white hover:scale-110 transition-transform duration-300">
                    <Facebook size={24} />
                  </a>
                  <a href="#" className="bg-gradient-to-br from-sky-500 to-blue-600 p-3 rounded-lg text-white hover:scale-110 transition-transform duration-300">
                    <Twitter size={24} />
                  </a>
                  <a href="#" className="bg-gradient-to-br from-pink-600 to-purple-600 p-3 rounded-lg text-white hover:scale-110 transition-transform duration-300">
                    <Instagram size={24} />
                  </a>
                  <a href="#" className="bg-gradient-to-br from-blue-700 to-blue-800 p-3 rounded-lg text-white hover:scale-110 transition-transform duration-300">
                    <Linkedin size={24} />
                  </a>
                </div>
              </div>

              {/* Emergency Support */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <AlertCircle className="mr-3" size={28} />
                  Need Urgent Help?
                </h3>
                <p className="text-green-100 mb-6">
                  For critical farming emergencies or urgent technical support, contact our 24/7 helpline.
                </p>
                <a
                  href="https://wa.me/60176127213?text=Hello%20SecureCrop%20Support%2C%20I%20need%20urgent%20help!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white text-green-700 py-3 px-6 rounded-lg font-bold hover:bg-green-50 transition-all transform hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions about SecureCrop
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-bold text-gray-900 flex items-center flex-1 pr-4">
                    <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFaqIndex === index ? (
                      <ChevronUp className="text-green-600" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${openFaqIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                >
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-700 ml-8 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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

export default ContactUs;
