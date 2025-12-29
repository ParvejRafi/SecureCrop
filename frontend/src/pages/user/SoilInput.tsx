import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Card, Input, Button, Badge } from '../../components/UI';
import { LocationSelector, LocationData } from '../../components/LocationSelector';
import { soilAPI } from '../../services/api';
import { Sprout, AlertTriangle, CheckCircle, Shield, TrendingUp, TrendingDown, Minus, Lightbulb, Droplets, ThermometerSun, Activity, Printer } from 'lucide-react';
import type { SoilInputResponse } from '../../types';

const SoilInput: React.FC = () => {
  const [formData, setFormData] = useState({
    N_level: '',
    P_level: '',
    K_level: '',
    ph: '',
    moisture: '',
    temperature: '',
  });
  const [location, setLocation] = useState<LocationData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SoilInputResponse | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  // Helper function to get parameter status and color
  const getParameterStatus = (param: string, value: number) => {
    const ranges: Record<string, { low: number; optimal: [number, number]; high: number }> = {
      N_level: { low: 40, optimal: [60, 140], high: 180 },
      P_level: { low: 30, optimal: [50, 120], high: 160 },
      K_level: { low: 35, optimal: [55, 130], high: 170 },
      ph: { low: 5.5, optimal: [6.0, 7.5], high: 8.0 },
      moisture: { low: 30, optimal: [40, 80], high: 90 },
      temperature: { low: 15, optimal: [20, 35], high: 40 },
    };

    const range = ranges[param];
    if (!range) return { status: 'unknown', color: 'gray', icon: Minus };

    if (value < range.low) return { status: 'low', color: 'orange', icon: TrendingDown };
    if (value >= range.optimal[0] && value <= range.optimal[1]) return { status: 'optimal', color: 'green', icon: CheckCircle };
    if (value > range.high) return { status: 'high', color: 'red', icon: TrendingUp };
    return { status: 'acceptable', color: 'yellow', icon: Minus };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = {
        N_level: parseFloat(formData.N_level),
        P_level: parseFloat(formData.P_level),
        K_level: parseFloat(formData.K_level),
        ph: parseFloat(formData.ph),
        moisture: parseFloat(formData.moisture),
        temperature: parseFloat(formData.temperature),
        ...location,
      };

      const response = await soilAPI.createSoilInput(data);
      setResult(response);

      // Clear form
      setFormData({
        N_level: '',
        P_level: '',
        K_level: '',
        ph: '',
        moisture: '',
        temperature: '',
      });
      setLocation({});
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to analyze soil. Please check your input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Progress */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl opacity-10"></div>
          <div className="relative p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
                <Sprout size={32} className="text-white" />
              </div>
              Soil Analysis & Recommendations
            </h1>
            <p className="text-lg text-gray-600 ml-16">
              AI-powered precision agriculture for optimal crop selection
            </p>

            {/* Progress Steps */}
            <div className="mt-6 ml-16 flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeStep >= 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className={`h-1 w-12 ${activeStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeStep >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
                <span className="text-sm font-medium">Parameters</span>
              </div>
              <div className={`h-1 w-12 ${activeStep >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeStep >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
                <span className="text-sm font-medium">Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="📍 Farm Location" icon={<Sprout size={20} />}>
              <LocationSelector
                value={location}
                onChange={(loc) => {
                  setLocation(loc);
                  if (loc.state && loc.city) setActiveStep(2);
                }}
                required={true}
                showCoordinates={true}
              />
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NPK Nutrients */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Activity size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Primary Nutrients (NPK)</h3>
                    <p className="text-sm text-gray-600">Essential macronutrients for plant growth</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Input
                      label="Nitrogen (N)"
                      type="number"
                      name="N_level"
                      value={formData.N_level}
                      onChange={handleChange}
                      placeholder="0 - 200 mg/kg"
                      step="0.1"
                      min="0"
                      max="200"
                      required
                    />
                    {formData.N_level && (
                      <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded bg-${getParameterStatus('N_level', parseFloat(formData.N_level)).color}-50`}>
                        {React.createElement(getParameterStatus('N_level', parseFloat(formData.N_level)).icon, { size: 14, className: `text-${getParameterStatus('N_level', parseFloat(formData.N_level)).color}-600` })}
                        <span className={`text-${getParameterStatus('N_level', parseFloat(formData.N_level)).color}-700 font-medium capitalize`}>
                          {getParameterStatus('N_level', parseFloat(formData.N_level)).status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Phosphorus (P)"
                      type="number"
                      name="P_level"
                      value={formData.P_level}
                      onChange={handleChange}
                      placeholder="0 - 200 mg/kg"
                      step="0.1"
                      min="0"
                      max="200"
                      required
                    />
                    {formData.P_level && (
                      <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded bg-${getParameterStatus('P_level', parseFloat(formData.P_level)).color}-50`}>
                        {React.createElement(getParameterStatus('P_level', parseFloat(formData.P_level)).icon, { size: 14, className: `text-${getParameterStatus('P_level', parseFloat(formData.P_level)).color}-600` })}
                        <span className={`text-${getParameterStatus('P_level', parseFloat(formData.P_level)).color}-700 font-medium capitalize`}>
                          {getParameterStatus('P_level', parseFloat(formData.P_level)).status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Potassium (K)"
                      type="number"
                      name="K_level"
                      value={formData.K_level}
                      onChange={handleChange}
                      placeholder="0 - 200 mg/kg"
                      step="0.1"
                      min="0"
                      max="200"
                      required
                    />
                    {formData.K_level && (
                      <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded bg-${getParameterStatus('K_level', parseFloat(formData.K_level)).color}-50`}>
                        {React.createElement(getParameterStatus('K_level', parseFloat(formData.K_level)).icon, { size: 14, className: `text-${getParameterStatus('K_level', parseFloat(formData.K_level)).color}-600` })}
                        <span className={`text-${getParameterStatus('K_level', parseFloat(formData.K_level)).color}-700 font-medium capitalize`}>
                          {getParameterStatus('K_level', parseFloat(formData.K_level)).status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Environmental Factors */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <ThermometerSun size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Environmental Conditions</h3>
                    <p className="text-sm text-gray-600">Soil pH, moisture, and temperature levels</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Input
                      label="pH Level"
                      type="number"
                      name="ph"
                      value={formData.ph}
                      onChange={handleChange}
                      placeholder="0 - 14"
                      step="0.1"
                      min="0"
                      max="14"
                      required
                    />
                    {formData.ph && (
                      <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded bg-${getParameterStatus('ph', parseFloat(formData.ph)).color}-50`}>
                        {React.createElement(getParameterStatus('ph', parseFloat(formData.ph)).icon, { size: 14, className: `text-${getParameterStatus('ph', parseFloat(formData.ph)).color}-600` })}
                        <span className={`text-${getParameterStatus('ph', parseFloat(formData.ph)).color}-700 font-medium capitalize`}>
                          {getParameterStatus('ph', parseFloat(formData.ph)).status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Moisture (%)"
                      type="number"
                      name="moisture"
                      value={formData.moisture}
                      onChange={handleChange}
                      placeholder="0 - 100%"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                    />
                    {formData.moisture && (
                      <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded bg-${getParameterStatus('moisture', parseFloat(formData.moisture)).color}-50`}>
                        <Droplets size={14} className={`text-${getParameterStatus('moisture', parseFloat(formData.moisture)).color}-600`} />
                        <span className={`text-${getParameterStatus('moisture', parseFloat(formData.moisture)).color}-700 font-medium capitalize`}>
                          {getParameterStatus('moisture', parseFloat(formData.moisture)).status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Temperature (°C)"
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      placeholder="-10 to 60°C"
                      step="0.1"
                      min="-10"
                      max="60"
                      required
                    />
                    {formData.temperature && (
                      <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded bg-${getParameterStatus('temperature', parseFloat(formData.temperature)).color}-50`}>
                        <ThermometerSun size={14} className={`text-${getParameterStatus('temperature', parseFloat(formData.temperature)).color}-600`} />
                        <span className={`text-${getParameterStatus('temperature', parseFloat(formData.temperature)).color}-700 font-medium capitalize`}>
                          {getParameterStatus('temperature', parseFloat(formData.temperature)).status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3 animate-shake">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Analysis Failed</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield size={16} className="text-green-600" />
                  <span>Protected by AI-powered cybersecurity</span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Analyzing...' : 'Analyze Soil'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Info Panel */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-yellow-500" />
                <h3 className="font-bold text-gray-900">Quick Tips</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="p-3 bg-blue-50 rounded-lg border-l-2 border-blue-500">
                  <p className="font-medium text-blue-900 mb-1">Nitrogen (N)</p>
                  <p className="text-blue-700">Essential for leaf growth. Optimal: 60-140 mg/kg</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-2 border-purple-500">
                  <p className="font-medium text-purple-900 mb-1">Phosphorus (P)</p>
                  <p className="text-purple-700">Promotes root development. Optimal: 50-120 mg/kg</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg border-l-2 border-pink-500">
                  <p className="font-medium text-pink-900 mb-1">Potassium (K)</p>
                  <p className="text-pink-700">Enhances disease resistance. Optimal: 55-130 mg/kg</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-2 border-green-500">
                  <p className="font-medium text-green-900 mb-1">pH Level</p>
                  <p className="text-green-700">Affects nutrient availability. Optimal: 6.0-7.5</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg border-l-2 border-cyan-500">
                  <p className="font-medium text-cyan-900 mb-1">Moisture</p>
                  <p className="text-cyan-700">Critical for plant hydration. Optimal: 40-80%</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border-l-2 border-orange-500">
                  <p className="font-medium text-orange-900 mb-1">Temperature</p>
                  <p className="text-orange-700">Influences plant metabolism. Optimal: 20-35°C</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-green-600" />
                <h3 className="font-bold text-gray-900">Security Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI-powered anomaly detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Data integrity validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Encrypted data transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Machine learning recommendations</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Success Animation Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl animate-bounce">
                    <CheckCircle size={48} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Analysis Complete!</h2>
                    <p className="text-green-100 text-lg">Your personalized crop recommendation is ready</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    setActiveStep(1);
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-all"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Security Check */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${result.security_check.anomaly_detected ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <Shield size={24} className={result.security_check.anomaly_detected ? 'text-yellow-600' : 'text-green-600'} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Security Validation</h3>
                  <p className="text-sm text-gray-600">AI-powered data integrity check</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                {result.security_check.anomaly_detected ? (
                  <>
                    <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={28} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-gray-900 text-lg">Anomaly Detected</p>
                        <Badge variant="warning" className="text-sm">{result.security_check.integrity_status}</Badge>
                      </div>
                      <p className="text-gray-700">
                        Your data shows unusual patterns but remains within valid ranges. The recommendation is still reliable.
                      </p>
                      <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">Note:</span> Unusual patterns may indicate unique soil conditions that require special attention.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={28} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-gray-900 text-lg">All Security Checks Passed</p>
                        <Badge variant="success" className="text-sm">{result.security_check.integrity_status}</Badge>
                      </div>
                      <p className="text-gray-700">
                        Data integrity verified successfully. Your soil parameters are within expected ranges.
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <CheckCircle size={20} className="text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-green-700 font-medium">Data Valid</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <Shield size={20} className="text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-green-700 font-medium">Integrity OK</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <Sprout size={20} className="text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-green-700 font-medium">AI Verified</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Recommendation */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Sprout size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Crop Recommendation</h3>
                  <p className="text-sm text-gray-600">AI-powered precision agriculture</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Main Recommendation */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-300/20 to-blue-300/20 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-white rounded-xl shadow-md">
                        <Sprout size={40} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Recommended Crop</p>
                        <h2 className="text-4xl font-black text-gray-900">{result.recommendation.crop_name}</h2>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
                      <div className="flex items-start gap-3 mb-4">
                        <Lightbulb size={20} className="text-yellow-500 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Why This Crop?</h4>
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {result.recommendation.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Soil Parameters Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Activity size={20} />
                    Your Soil Analysis Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">Nitrogen</span>
                        {React.createElement(getParameterStatus('N_level', result.soil_input.N_level).icon, {
                          size: 16,
                          className: `text-${getParameterStatus('N_level', result.soil_input.N_level).color}-600`
                        })}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{result.soil_input.N_level}</p>
                      <p className="text-xs text-gray-500">mg/kg</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">Phosphorus</span>
                        {React.createElement(getParameterStatus('P_level', result.soil_input.P_level).icon, {
                          size: 16,
                          className: `text-${getParameterStatus('P_level', result.soil_input.P_level).color}-600`
                        })}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{result.soil_input.P_level}</p>
                      <p className="text-xs text-gray-500">mg/kg</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">Potassium</span>
                        {React.createElement(getParameterStatus('K_level', result.soil_input.K_level).icon, {
                          size: 16,
                          className: `text-${getParameterStatus('K_level', result.soil_input.K_level).color}-600`
                        })}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{result.soil_input.K_level}</p>
                      <p className="text-xs text-gray-500">mg/kg</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">pH Level</span>
                        {React.createElement(getParameterStatus('ph', result.soil_input.ph).icon, {
                          size: 16,
                          className: `text-${getParameterStatus('ph', result.soil_input.ph).color}-600`
                        })}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{result.soil_input.ph}</p>
                      <p className="text-xs text-gray-500">pH</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">Moisture</span>
                        <Droplets size={16} className={`text-${getParameterStatus('moisture', result.soil_input.moisture).color}-600`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{result.soil_input.moisture}</p>
                      <p className="text-xs text-gray-500">%</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">Temperature</span>
                        <ThermometerSun size={16} className={`text-${getParameterStatus('temperature', result.soil_input.temperature).color}-600`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{result.soil_input.temperature}</p>
                      <p className="text-xs text-gray-500">°C</p>
                    </div>
                  </div>
                </div>

                {/* AI Farming Guide */}
                {result.farming_guide && (
                  <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                        <Lightbulb size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Farming Guide</h3>
                        <p className="text-sm text-purple-600">
                          {result.farming_guide.source === 'gemini_ai' ? '✨ Powered by Gemini AI' : '📖 Basic Guide'}
                        </p>
                      </div>
                    </div>

                    {/* Why Recommended */}
                    <div className="bg-white/80 rounded-xl p-5 mb-4 shadow-sm">
                      <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">🌱</span> Why {result.farming_guide.crop_name}?
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{result.farming_guide.why_recommended}</p>
                    </div>

                    {/* Growth Info */}
                    {(result.farming_guide.growth_duration || result.farming_guide.expected_yield) && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {result.farming_guide.growth_duration && (
                          <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                            <span className="text-2xl mb-2 block">📅</span>
                            <p className="text-xs text-gray-600 uppercase font-medium">Growth Duration</p>
                            <p className="text-lg font-bold text-purple-900">{result.farming_guide.growth_duration}</p>
                          </div>
                        )}
                        {result.farming_guide.expected_yield && (
                          <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                            <span className="text-2xl mb-2 block">🌾</span>
                            <p className="text-xs text-gray-600 uppercase font-medium">Expected Yield</p>
                            <p className="text-lg font-bold text-purple-900">{result.farming_guide.expected_yield}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cultivation Steps */}
                    {result.farming_guide.cultivation_steps && result.farming_guide.cultivation_steps.length > 0 && (
                      <div className="bg-white/80 rounded-xl p-5 mb-4 shadow-sm">
                        <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                          <span className="text-xl">📋</span> Cultivation Steps
                        </h4>
                        <div className="space-y-3">
                          {result.farming_guide.cultivation_steps.map((step: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <p className="text-gray-700 pt-1">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Watering & Fertilization */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {result.farming_guide.watering_guide && (
                        <div className="bg-white/80 rounded-xl p-5 shadow-sm">
                          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <Droplets size={20} className="text-blue-500" /> Watering Guide
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{result.farming_guide.watering_guide}</p>
                        </div>
                      )}
                      {result.farming_guide.fertilization_tips && (
                        <div className="bg-white/80 rounded-xl p-5 shadow-sm">
                          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                            <span className="text-lg">🌿</span> Fertilization Tips
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{result.farming_guide.fertilization_tips}</p>
                        </div>
                      )}
                    </div>

                    {/* Harvesting Tips */}
                    {result.farming_guide.harvesting_tips && (
                      <div className="bg-white/80 rounded-xl p-5 mb-4 shadow-sm">
                        <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">🌾</span> Harvesting Tips
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{result.farming_guide.harvesting_tips}</p>
                      </div>
                    )}

                    {/* Common Problems */}
                    {result.farming_guide.common_problems && result.farming_guide.common_problems.length > 0 && (
                      <div className="bg-white/80 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                          <AlertTriangle size={20} className="text-red-500" /> Common Problems & Solutions
                        </h4>
                        <div className="space-y-3">
                          {result.farming_guide.common_problems.map((item: { problem: string, solution: string }, index: number) => (
                            <div key={index} className="border border-red-100 rounded-lg overflow-hidden">
                              <div className="bg-red-50 px-4 py-2">
                                <p className="font-semibold text-red-800 text-sm">⚠️ {item.problem}</p>
                              </div>
                              <div className="px-4 py-3 bg-green-50">
                                <p className="text-green-800 text-sm">✅ {item.solution}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center pt-4 no-print">
                  <button
                    onClick={() => {
                      // Create a new window for printing
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>SecureCrop - Soil Analysis Report</title>
                            <style>
                              * { margin: 0; padding: 0; box-sizing: border-box; }
                              body { font-family: Arial, sans-serif; color: #1a1a1a; background: white; }
                              .report { max-width: 800px; margin: 0 auto; padding: 20px; }
                              .header { border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; }
                              .logo { font-size: 28px; font-weight: bold; color: #166534; }
                              .report-info { text-align: right; font-size: 12px; color: #6b7280; }
                              .crop-box { background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%); border: 2px solid #16a34a; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
                              .crop-name { font-size: 36px; font-weight: 800; color: #166534; margin: 10px 0; }
                              .section { margin: 25px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
                              .section-title { font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #dcfce7; }
                              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                              th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-size: 13px; }
                              th { background: #f3f4f6; font-weight: 600; }
                              .status-optimal { color: #10B981; background: #d1fae5; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
                              .status-low { color: #F59E0B; background: #fef3c7; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
                              .status-high { color: #EF4444; background: #fee2e2; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
                              .explanation-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 15px 0; border-radius: 0 8px 8px 0; }
                              .security-box { display: flex; align-items: center; gap: 15px; padding: 15px; background: ${result.security_check.anomaly_detected ? '#fef3c7' : '#dcfce7'}; border-radius: 8px; border: 1px solid ${result.security_check.anomaly_detected ? '#f59e0b' : '#16a34a'}; }
                              .tips-list { padding-left: 20px; line-height: 2; }
                              .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
                              @media print { @page { size: A4; margin: 15mm; } }
                            </style>
                          </head>
                          <body>
                            <div class="report">
                              <div class="header">
                                <div>
                                  <div class="logo">🌾 SecureCrop</div>
                                  <div style="color: #6b7280; margin-top: 5px;">AI-Powered Precision Agriculture System</div>
                                </div>
                                <div class="report-info">
                                  <div style="font-weight: 600; color: #166534;">SOIL ANALYSIS REPORT</div>
                                  <div>Report ID: SC-${Date.now().toString(36).toUpperCase()}</div>
                                  <div>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                              </div>

                              <div class="crop-box">
                                <div style="font-size: 14px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">RECOMMENDED CROP</div>
                                <div class="crop-name">${result.recommendation.crop_name}</div>
                                <div style="color: #166534; font-size: 14px;">Based on AI analysis of your soil parameters</div>
                              </div>

                              <div class="section">
                                <div class="section-title">📊 Soil Analysis Results</div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Parameter</th>
                                      <th>Your Value</th>
                                      <th>Status</th>
                                      <th>Optimal Range</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td><strong>Nitrogen (N)</strong></td>
                                      <td>${result.soil_input.N_level} mg/kg</td>
                                      <td><span class="status-${result.soil_input.N_level >= 60 && result.soil_input.N_level <= 140 ? 'optimal' : result.soil_input.N_level < 40 ? 'low' : 'high'}">${result.soil_input.N_level >= 60 && result.soil_input.N_level <= 140 ? 'Optimal' : result.soil_input.N_level < 40 ? 'Low' : result.soil_input.N_level > 180 ? 'High' : 'Acceptable'}</span></td>
                                      <td>60 - 140 mg/kg</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Phosphorus (P)</strong></td>
                                      <td>${result.soil_input.P_level} mg/kg</td>
                                      <td><span class="status-${result.soil_input.P_level >= 50 && result.soil_input.P_level <= 120 ? 'optimal' : result.soil_input.P_level < 30 ? 'low' : 'high'}">${result.soil_input.P_level >= 50 && result.soil_input.P_level <= 120 ? 'Optimal' : result.soil_input.P_level < 30 ? 'Low' : result.soil_input.P_level > 160 ? 'High' : 'Acceptable'}</span></td>
                                      <td>50 - 120 mg/kg</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Potassium (K)</strong></td>
                                      <td>${result.soil_input.K_level} mg/kg</td>
                                      <td><span class="status-${result.soil_input.K_level >= 55 && result.soil_input.K_level <= 130 ? 'optimal' : result.soil_input.K_level < 35 ? 'low' : 'high'}">${result.soil_input.K_level >= 55 && result.soil_input.K_level <= 130 ? 'Optimal' : result.soil_input.K_level < 35 ? 'Low' : result.soil_input.K_level > 170 ? 'High' : 'Acceptable'}</span></td>
                                      <td>55 - 130 mg/kg</td>
                                    </tr>
                                    <tr>
                                      <td><strong>pH Level</strong></td>
                                      <td>${result.soil_input.ph}</td>
                                      <td><span class="status-${result.soil_input.ph >= 6.0 && result.soil_input.ph <= 7.5 ? 'optimal' : result.soil_input.ph < 5.5 ? 'low' : 'high'}">${result.soil_input.ph >= 6.0 && result.soil_input.ph <= 7.5 ? 'Optimal' : result.soil_input.ph < 5.5 ? 'Low' : result.soil_input.ph > 8.0 ? 'High' : 'Acceptable'}</span></td>
                                      <td>6.0 - 7.5 pH</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Moisture</strong></td>
                                      <td>${result.soil_input.moisture}%</td>
                                      <td><span class="status-${result.soil_input.moisture >= 40 && result.soil_input.moisture <= 80 ? 'optimal' : result.soil_input.moisture < 30 ? 'low' : 'high'}">${result.soil_input.moisture >= 40 && result.soil_input.moisture <= 80 ? 'Optimal' : result.soil_input.moisture < 30 ? 'Low' : result.soil_input.moisture > 90 ? 'High' : 'Acceptable'}</span></td>
                                      <td>40 - 80%</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Temperature</strong></td>
                                      <td>${result.soil_input.temperature}°C</td>
                                      <td><span class="status-${result.soil_input.temperature >= 20 && result.soil_input.temperature <= 35 ? 'optimal' : result.soil_input.temperature < 15 ? 'low' : 'high'}">${result.soil_input.temperature >= 20 && result.soil_input.temperature <= 35 ? 'Optimal' : result.soil_input.temperature < 15 ? 'Low' : result.soil_input.temperature > 40 ? 'High' : 'Acceptable'}</span></td>
                                      <td>20 - 35°C</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div class="section">
                                <div class="section-title">🌱 Expert Analysis & Recommendations</div>
                                <div class="explanation-box">
                                  <div style="font-weight: 600; margin-bottom: 10px; color: #92400e;">Why ${result.recommendation.crop_name} is recommended for your soil:</div>
                                  <div style="white-space: pre-line; color: #1a1a1a; line-height: 1.8;">${result.recommendation.explanation}</div>
                                </div>
                              </div>

                              <div class="section">
                                <div class="section-title">🛡️ Data Verification Status</div>
                                <div class="security-box">
                                  <div>
                                    <div style="font-weight: 600; color: ${result.security_check.anomaly_detected ? '#92400e' : '#166534'};">
                                      ${result.security_check.anomaly_detected ? '⚠️ Anomaly Detected' : '✅ All Checks Passed'}
                                    </div>
                                    <div style="font-size: 13px; color: ${result.security_check.anomaly_detected ? '#a16207' : '#15803d'};">
                                      ${result.security_check.anomaly_detected ? 'Your data shows unusual patterns but remains valid. The recommendation is reliable.' : 'Data integrity verified. Status: ' + result.security_check.integrity_status}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div class="section">
                                <div class="section-title">📈 General Growing Tips</div>
                                <ul class="tips-list">
                                  <li>Monitor soil moisture regularly and adjust irrigation as needed</li>
                                  <li>Consider soil testing every 6 months to track nutrient changes</li>
                                  <li>Apply organic matter to improve soil structure and fertility</li>
                                  <li>Rotate crops annually to prevent soil nutrient depletion</li>
                                  <li>Consult local agricultural extension services for region-specific advice</li>
                                </ul>
                              </div>

                              ${result.farming_guide ? `
                              <div class="section" style="background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%); border-color: #a855f7;">
                                <div class="section-title" style="color: #7c3aed;">🤖 AI Farming Guide ${result.farming_guide.source === 'gemini_ai' ? '(Powered by Gemini AI)' : ''}</div>
                                
                                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                  <div style="font-weight: 600; color: #6b21a8; margin-bottom: 8px;">🌱 Why ${result.farming_guide.crop_name}?</div>
                                  <div style="color: #374151; line-height: 1.6;">${result.farming_guide.why_recommended}</div>
                                </div>

                                ${result.farming_guide.growth_duration || result.farming_guide.expected_yield ? `
                                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                  ${result.farming_guide.growth_duration ? `
                                  <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 5px;">📅</div>
                                    <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Growth Duration</div>
                                    <div style="font-weight: 700; color: #6b21a8;">${result.farming_guide.growth_duration}</div>
                                  </div>` : ''}
                                  ${result.farming_guide.expected_yield ? `
                                  <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 5px;">🌾</div>
                                    <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Expected Yield</div>
                                    <div style="font-weight: 700; color: #6b21a8;">${result.farming_guide.expected_yield}</div>
                                  </div>` : ''}
                                </div>` : ''}

                                ${result.farming_guide.cultivation_steps && result.farming_guide.cultivation_steps.length > 0 ? `
                                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                  <div style="font-weight: 600; color: #6b21a8; margin-bottom: 10px;">📋 Cultivation Steps</div>
                                  <ol style="padding-left: 20px; line-height: 1.8; color: #374151;">
                                    ${result.farming_guide.cultivation_steps.map((step: string) => `<li>${step}</li>`).join('')}
                                  </ol>
                                </div>` : ''}

                                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                  ${result.farming_guide.watering_guide ? `
                                  <div style="flex: 1; background: white; padding: 15px; border-radius: 8px;">
                                    <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">💧 Watering Guide</div>
                                    <div style="color: #374151; font-size: 13px; line-height: 1.6;">${result.farming_guide.watering_guide}</div>
                                  </div>` : ''}
                                  ${result.farming_guide.fertilization_tips ? `
                                  <div style="flex: 1; background: white; padding: 15px; border-radius: 8px;">
                                    <div style="font-weight: 600; color: #166534; margin-bottom: 8px;">🌿 Fertilization Tips</div>
                                    <div style="color: #374151; font-size: 13px; line-height: 1.6;">${result.farming_guide.fertilization_tips}</div>
                                  </div>` : ''}
                                </div>

                                ${result.farming_guide.harvesting_tips ? `
                                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                  <div style="font-weight: 600; color: #c2410c; margin-bottom: 8px;">🌾 Harvesting Tips</div>
                                  <div style="color: #374151; line-height: 1.6;">${result.farming_guide.harvesting_tips}</div>
                                </div>` : ''}

                                ${result.farming_guide.common_problems && result.farming_guide.common_problems.length > 0 ? `
                                <div style="background: white; padding: 15px; border-radius: 8px;">
                                  <div style="font-weight: 600; color: #b91c1c; margin-bottom: 10px;">⚠️ Common Problems & Solutions</div>
                                  ${result.farming_guide.common_problems.map((item: { problem: string, solution: string }) => `
                                    <div style="margin-bottom: 10px; border: 1px solid #fecaca; border-radius: 6px; overflow: hidden;">
                                      <div style="background: #fef2f2; padding: 8px 12px; font-weight: 600; color: #991b1b; font-size: 13px;">⚠️ ${item.problem}</div>
                                      <div style="background: #f0fdf4; padding: 8px 12px; color: #166534; font-size: 13px;">✅ ${item.solution}</div>
                                    </div>
                                  `).join('')}
                                </div>` : ''}
                              </div>` : ''}

                              <div class="footer">
                                <div><strong>SecureCrop - AI-Powered Precision Agriculture</strong></div>
                                <div style="margin: 5px 0;">This report was generated using machine learning algorithms trained on agricultural data.</div>
                                <div>For best results, combine AI recommendations with local expert knowledge.</div>
                                <div style="margin-top: 10px; font-size: 11px;">Report Generated: ${new Date().toLocaleString()} | © 2025 SecureCrop. All rights reserved.</div>
                              </div>
                            </div>
                          </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          printWindow.close();
                        }, 250);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    <Printer size={18} />
                    Print Report
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setActiveStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Analyze Another Sample
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SoilInput;
