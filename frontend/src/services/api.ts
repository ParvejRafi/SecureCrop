import axios from 'axios';
import type {
  User,
  LoginResponse,
  RegisterData,
  SoilInputData,
  SoilInputResponse,
  SoilInput,
  Recommendation,
  FeedbackData,
  Feedback,
  CyberLog,
  AdminLog,
  CyberLogStats,
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

// Soil Input APIs
export const soilAPI = {
  createSoilInput: async (data: SoilInputData): Promise<SoilInputResponse> => {
    const response = await api.post('/soil-inputs/create/', data);
    return response.data;
  },

  getSoilInputs: async (): Promise<SoilInput[]> => {
    const response = await api.get('/soil-inputs/');
    return response.data.results || response.data;
  },

  getSoilInputById: async (id: number): Promise<SoilInput> => {
    const response = await api.get(`/soil-inputs/${id}/`);
    return response.data;
  },
};

// Recommendation APIs
export const recommendationAPI = {
  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await api.get('/recommendations/');
    return response.data.results || response.data;
  },

  getRecommendationById: async (id: number): Promise<Recommendation> => {
    const response = await api.get(`/recommendations/${id}/`);
    return response.data;
  },
};

// Feedback APIs
export const feedbackAPI = {
  createFeedback: async (data: FeedbackData): Promise<{ feedback: Feedback; message: string }> => {
    const response = await api.post('/feedback/create/', data);
    return response.data;
  },

  getFeedbacks: async (): Promise<Feedback[]> => {
    const response = await api.get('/feedback/');
    return response.data.results || response.data;
  },

  getFeedbackStats: async (): Promise<{ total_feedbacks: number; average_rating: number }> => {
    const response = await api.get('/feedback/stats/');
    return response.data;
  },
};

// Admin APIs
export const adminAPI = {
  // Cyber Logs
  getCyberLogs: async (params?: { anomaly_detected?: boolean; integrity_status?: string }): Promise<CyberLog[]> => {
    const response = await api.get('/admin/logs/cyber/', { params });
    return response.data.results || response.data;
  },

  getCyberLogStats: async (): Promise<CyberLogStats> => {
    const response = await api.get('/admin/logs/cyber/stats/');
    return response.data;
  },

  // Admin Logs
  getAdminLogs: async (): Promise<AdminLog[]> => {
    const response = await api.get('/admin/logs/admin-actions/');
    return response.data.results || response.data;
  },

  // Soil Inputs (Admin view)
  getAllSoilInputs: async (): Promise<SoilInput[]> => {
    const response = await api.get('/soil-inputs/admin/all/');
    return response.data.results || response.data;
  },
};

// Notifications API (Weather Alerts)
export const notificationsAPI = {
  getStats: async () => {
    const response = await api.get('/notifications/stats/');
    return response.data;
  },

  getEligibleUsers: async () => {
    const response = await api.get('/notifications/eligible-users/');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/notifications/history/');
    return response.data;
  },

  sendAlerts: async (sendToAll: boolean, userIds?: number[]) => {
    const response = await api.post('/notifications/send-alerts/', {
      send_to_all: sendToAll,
      user_ids: userIds
    });
    return response.data;
  },
};

// Contact Inquiries API (Admin)
export const contactAPI = {
  getList: async (filters?: { status?: string; category?: string }) => {
    const response = await api.get('/contact/admin/list/', { params: filters });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/contact/admin/stats/');
    return response.data;
  },

  getDetail: async (inquiryId: number) => {
    const response = await api.get(`/contact/admin/${inquiryId}/`);
    return response.data;
  },

  updateStatus: async (inquiryId: number, status: string) => {
    const response = await api.patch(`/contact/admin/${inquiryId}/update/`, { status });
    return response.data;
  },

  sendReply: async (inquiryId: number, reply: string) => {
    const response = await api.post(`/contact/admin/${inquiryId}/reply/`, { reply });
    return response.data;
  },
};

export default api;

