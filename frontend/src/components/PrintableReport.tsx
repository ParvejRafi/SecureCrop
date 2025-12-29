import React, { forwardRef } from 'react';
import { Sprout, CheckCircle, AlertTriangle, Droplets, ThermometerSun, Activity, MapPin, Calendar, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SoilInputResponse } from '../types';

interface PrintableReportProps {
    result: SoilInputResponse;
    location?: {
        state?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
    };
}

// Helper function to get parameter status
const getParameterStatus = (param: string, value: number) => {
    const ranges: Record<string, { low: number; optimal: [number, number]; high: number; unit: string }> = {
        N_level: { low: 40, optimal: [60, 140], high: 180, unit: 'mg/kg' },
        P_level: { low: 30, optimal: [50, 120], high: 160, unit: 'mg/kg' },
        K_level: { low: 35, optimal: [55, 130], high: 170, unit: 'mg/kg' },
        ph: { low: 5.5, optimal: [6.0, 7.5], high: 8.0, unit: 'pH' },
        moisture: { low: 30, optimal: [40, 80], high: 90, unit: '%' },
        temperature: { low: 15, optimal: [20, 35], high: 40, unit: '°C' },
    };

    const range = ranges[param];
    if (!range) return { status: 'Unknown', color: '#6B7280', optimalRange: 'N/A' };

    const optimalRange = `${range.optimal[0]} - ${range.optimal[1]} ${range.unit}`;

    if (value < range.low) return { status: 'Low', color: '#F59E0B', optimalRange };
    if (value >= range.optimal[0] && value <= range.optimal[1]) return { status: 'Optimal', color: '#10B981', optimalRange };
    if (value > range.high) return { status: 'High', color: '#EF4444', optimalRange };
    return { status: 'Acceptable', color: '#EAB308', optimalRange };
};

const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(({ result, location }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const reportId = `SC-${Date.now().toString(36).toUpperCase()}`;

    return (
        <div ref={ref} className="print-report bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Print Styles */}
            <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-report, .print-report * {
            visibility: visible !important;
          }
          .print-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
        .print-report {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #1a1a1a;
        }
        .print-report h1 { font-size: 28px; margin: 0; }
        .print-report h2 { font-size: 20px; margin: 20px 0 10px 0; }
        .print-report h3 { font-size: 16px; margin: 15px 0 8px 0; }
        .print-report p { font-size: 14px; line-height: 1.6; margin: 5px 0; }
        .print-report table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .print-report th, .print-report td { 
          border: 1px solid #e5e7eb; 
          padding: 12px; 
          text-align: left; 
          font-size: 13px;
        }
        .print-report th { background: #f3f4f6; font-weight: 600; }
        .print-report .header { 
          border-bottom: 3px solid #16a34a; 
          padding-bottom: 20px; 
          margin-bottom: 25px;
        }
        .print-report .section { 
          margin: 25px 0; 
          padding: 20px; 
          border: 1px solid #e5e7eb; 
          border-radius: 8px;
          background: #fafafa;
        }
        .print-report .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #166534;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #dcfce7;
        }
        .print-report .crop-box {
          background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
          border: 2px solid #16a34a;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
        }
        .print-report .crop-name {
          font-size: 36px;
          font-weight: 800;
          color: #166534;
          margin: 10px 0;
        }
        .print-report .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 15px 0;
        }
        .print-report .info-item {
          background: white;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .print-report .info-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .print-report .info-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-top: 4px;
        }
        .print-report .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }
        .print-report .explanation-box {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 15px 20px;
          margin: 15px 0;
          border-radius: 0 8px 8px 0;
        }
        .print-report .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        .print-report .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          color: rgba(22, 163, 74, 0.05);
          font-weight: bold;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

            {/* Header */}
            <div className="header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🌾 SecureCrop
                        </h1>
                        <p style={{ color: '#6b7280', marginTop: '5px' }}>AI-Powered Precision Agriculture System</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 600, color: '#166534' }}>SOIL ANALYSIS REPORT</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Report ID: {reportId}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>{currentDate}</p>
                    </div>
                </div>
            </div>

            {/* Farm Location */}
            {(location?.state || location?.city) && (
                <div className="section">
                    <div className="section-title">
                        <MapPin size={20} />
                        Farm Location
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">State/Region</div>
                            <div className="info-value">{location?.state || 'Not specified'}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">City/District</div>
                            <div className="info-value">{location?.city || 'Not specified'}</div>
                        </div>
                        {location?.latitude && location?.longitude && (
                            <>
                                <div className="info-item">
                                    <div className="info-label">Latitude</div>
                                    <div className="info-value">{location.latitude.toFixed(6)}°</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Longitude</div>
                                    <div className="info-value">{location.longitude.toFixed(6)}°</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Main Recommendation */}
            <div className="crop-box">
                <p style={{ fontSize: '14px', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    RECOMMENDED CROP
                </p>
                <div className="crop-name">{result.recommendation.crop_name}</div>
                <p style={{ color: '#166534', fontSize: '14px' }}>
                    Based on AI analysis of your soil parameters
                </p>
            </div>

            {/* Soil Analysis Results */}
            <div className="section">
                <div className="section-title">
                    <Activity size={20} />
                    Soil Analysis Results
                </div>

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
                            <td>{result.soil_input.N_level} mg/kg</td>
                            <td>
                                <span className="status-badge" style={{
                                    backgroundColor: getParameterStatus('N_level', result.soil_input.N_level).color + '20',
                                    color: getParameterStatus('N_level', result.soil_input.N_level).color
                                }}>
                                    {getParameterStatus('N_level', result.soil_input.N_level).status}
                                </span>
                            </td>
                            <td>{getParameterStatus('N_level', result.soil_input.N_level).optimalRange}</td>
                        </tr>
                        <tr>
                            <td><strong>Phosphorus (P)</strong></td>
                            <td>{result.soil_input.P_level} mg/kg</td>
                            <td>
                                <span className="status-badge" style={{
                                    backgroundColor: getParameterStatus('P_level', result.soil_input.P_level).color + '20',
                                    color: getParameterStatus('P_level', result.soil_input.P_level).color
                                }}>
                                    {getParameterStatus('P_level', result.soil_input.P_level).status}
                                </span>
                            </td>
                            <td>{getParameterStatus('P_level', result.soil_input.P_level).optimalRange}</td>
                        </tr>
                        <tr>
                            <td><strong>Potassium (K)</strong></td>
                            <td>{result.soil_input.K_level} mg/kg</td>
                            <td>
                                <span className="status-badge" style={{
                                    backgroundColor: getParameterStatus('K_level', result.soil_input.K_level).color + '20',
                                    color: getParameterStatus('K_level', result.soil_input.K_level).color
                                }}>
                                    {getParameterStatus('K_level', result.soil_input.K_level).status}
                                </span>
                            </td>
                            <td>{getParameterStatus('K_level', result.soil_input.K_level).optimalRange}</td>
                        </tr>
                        <tr>
                            <td><strong>pH Level</strong></td>
                            <td>{result.soil_input.ph}</td>
                            <td>
                                <span className="status-badge" style={{
                                    backgroundColor: getParameterStatus('ph', result.soil_input.ph).color + '20',
                                    color: getParameterStatus('ph', result.soil_input.ph).color
                                }}>
                                    {getParameterStatus('ph', result.soil_input.ph).status}
                                </span>
                            </td>
                            <td>{getParameterStatus('ph', result.soil_input.ph).optimalRange}</td>
                        </tr>
                        <tr>
                            <td><strong>Moisture</strong></td>
                            <td>{result.soil_input.moisture}%</td>
                            <td>
                                <span className="status-badge" style={{
                                    backgroundColor: getParameterStatus('moisture', result.soil_input.moisture).color + '20',
                                    color: getParameterStatus('moisture', result.soil_input.moisture).color
                                }}>
                                    {getParameterStatus('moisture', result.soil_input.moisture).status}
                                </span>
                            </td>
                            <td>{getParameterStatus('moisture', result.soil_input.moisture).optimalRange}</td>
                        </tr>
                        <tr>
                            <td><strong>Temperature</strong></td>
                            <td>{result.soil_input.temperature}°C</td>
                            <td>
                                <span className="status-badge" style={{
                                    backgroundColor: getParameterStatus('temperature', result.soil_input.temperature).color + '20',
                                    color: getParameterStatus('temperature', result.soil_input.temperature).color
                                }}>
                                    {getParameterStatus('temperature', result.soil_input.temperature).status}
                                </span>
                            </td>
                            <td>{getParameterStatus('temperature', result.soil_input.temperature).optimalRange}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Expert Explanation */}
            <div className="section">
                <div className="section-title">
                    <Sprout size={20} />
                    Expert Analysis & Recommendations
                </div>
                <div className="explanation-box">
                    <p style={{ fontWeight: 600, marginBottom: '10px', color: '#92400e' }}>
                        Why {result.recommendation.crop_name} is recommended for your soil:
                    </p>
                    <p style={{ whiteSpace: 'pre-line', color: '#1a1a1a', lineHeight: '1.8' }}>
                        {result.recommendation.explanation}
                    </p>
                </div>
            </div>

            {/* Security Status */}
            <div className="section">
                <div className="section-title">
                    <Shield size={20} />
                    Data Verification Status
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: result.security_check.anomaly_detected ? '#fef3c7' : '#dcfce7',
                    borderRadius: '8px',
                    border: `1px solid ${result.security_check.anomaly_detected ? '#f59e0b' : '#16a34a'}`
                }}>
                    {result.security_check.anomaly_detected ? (
                        <>
                            <AlertTriangle size={24} color="#f59e0b" />
                            <div>
                                <p style={{ fontWeight: 600, color: '#92400e' }}>Anomaly Detected</p>
                                <p style={{ fontSize: '13px', color: '#a16207' }}>
                                    Your data shows unusual patterns but remains valid. The recommendation is reliable.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={24} color="#16a34a" />
                            <div>
                                <p style={{ fontWeight: 600, color: '#166534' }}>All Checks Passed</p>
                                <p style={{ fontSize: '13px', color: '#15803d' }}>
                                    Data integrity verified. Status: {result.security_check.integrity_status}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Growing Tips */}
            <div className="section">
                <div className="section-title">
                    <TrendingUp size={20} />
                    General Growing Tips
                </div>
                <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
                    <li>Monitor soil moisture regularly and adjust irrigation as needed</li>
                    <li>Consider soil testing every 6 months to track nutrient changes</li>
                    <li>Apply organic matter to improve soil structure and fertility</li>
                    <li>Rotate crops annually to prevent soil nutrient depletion</li>
                    <li>Consult local agricultural extension services for region-specific advice</li>
                </ul>
            </div>

            {/* Footer */}
            <div className="footer">
                <p><strong>SecureCrop - AI-Powered Precision Agriculture</strong></p>
                <p>This report was generated using machine learning algorithms trained on agricultural data.</p>
                <p>For best results, combine AI recommendations with local expert knowledge.</p>
                <p style={{ marginTop: '10px', fontSize: '11px' }}>
                    Report Generated: {new Date().toLocaleString()} | © 2025 SecureCrop. All rights reserved.
                </p>
            </div>
        </div>
    );
});

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
