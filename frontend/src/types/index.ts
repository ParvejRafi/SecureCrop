export interface User {
  id: number;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
}

export interface SoilInput {
  id: number;
  user: number;
  user_email: string;
  user_username: string;
  N_level: number;
  P_level: number;
  K_level: number;
  ph: number;
  moisture: number;
  temperature: number;
  integrity_hash: string | null;
  created_at: string;
}

export interface SoilInputData {
  N_level: number;
  P_level: number;
  K_level: number;
  ph: number;
  moisture: number;
  temperature: number;
}

export interface Recommendation {
  id: number;
  crop_name: string;
  explanation: string;
  created_at: string;
  soil_input?: SoilInput;
}

export interface FarmingGuide {
  source: 'gemini_ai' | 'fallback';
  crop_name: string;
  why_recommended: string;
  cultivation_steps: string[];
  watering_guide: string;
  fertilization_tips: string;
  harvesting_tips: string;
  common_problems: Array<{
    problem: string;
    solution: string;
  }>;
  expected_yield: string;
  growth_duration: string;
}

export interface SoilInputResponse {
  soil_input: SoilInput;
  recommendation: Recommendation;
  farming_guide?: FarmingGuide;
  security_check: {
    anomaly_detected: boolean;
    integrity_status: string;
  };
  message: string;
}

export interface Feedback {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  rating: number;
  comments: string;
  created_at: string;
}

export interface FeedbackData {
  rating: number;
  comments: string;
}

export interface CyberLog {
  id: number;
  input: number | null;
  input_id: number | null;
  user_username: string | null;
  anomaly_detected: boolean;
  integrity_status: string;
  details: string;
  timestamp: string;
}

export interface AdminLog {
  id: number;
  admin: number;
  admin_username: string;
  admin_email: string;
  action: string;
  timestamp: string;
}

export interface DashboardStats {
  total_users?: number;
  total_inputs?: number;
  total_anomalies?: number;
  average_rating?: number;
  recent_inputs?: SoilInput[];
  recent_recommendations?: Recommendation[];
}

export interface CyberLogStats {
  total_logs: number;
  anomalies_detected: number;
  anomaly_rate: number;
  status_breakdown: Array<{
    integrity_status: string;
    count: number;
  }>;
}
