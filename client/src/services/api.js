import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('growcap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('growcap_token');
      localStorage.removeItem('growcap_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Portfolio
export const getPortfolios = () => API.get('/portfolio');
export const createPortfolio = (data) => API.post('/portfolio', data);
export const getPortfolioSummary = (id) => API.get(`/portfolio/${id}/summary`);
export const addHolding = (portfolioId, data) => API.post(`/portfolio/${portfolioId}/holdings`, data);
export const updateHolding = (holdingId, data) => API.put(`/portfolio/holdings/${holdingId}`, data);
export const deleteHolding = (holdingId) => API.delete(`/portfolio/holdings/${holdingId}`);
export const getAllHoldings = () => API.get('/portfolio/holdings/all');
export const getTransactions = () => API.get('/portfolio/transactions');

// Market
export const searchStocks = (keywords) => API.get(`/market/search?keywords=${keywords}`);
export const getQuote = (symbol) => API.get(`/market/quote/${symbol}`);
export const getDailyData = (symbol) => API.get(`/market/daily/${symbol}`);
export const getChartData = (symbol) => API.get(`/market/chart/${symbol}`);

// AI
export const chatAI = (data) => API.post('/ai/chat', data);
export const getChatHistory = (sessionId) => API.get(`/ai/history${sessionId ? `?session_id=${sessionId}` : ''}`);
export const uploadDocument = (formData) => API.post('/ai/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getDocuments = () => API.get('/ai/documents');
export const deleteDocument = (id) => API.delete(`/ai/documents/${id}`);
export const searchTavily = (query) => API.post('/ai/search', { query });
export const portfolioReview = () => API.post('/ai/portfolio-review');
export const analyseAllocation = (data) => API.post('/ai/analyse-allocation', data);



// Setup / Onboarding
export const completeOnboarding = (data) => API.post('/onboarding/complete', data);
export const fetchOnboardingPlan = () => API.get('/onboarding/plan');
export const submitDiscovery = (data) => API.post('/onboarding/discovery', data);
export const updateDiscoveryProfile = (data) => API.put('/onboarding/profile', data);
export const getDiscoveryData = () => API.get('/onboarding/discovery');
export const applyStrategy = (data) => API.post('/onboarding/apply-strategy', data);

// Appointments
export const bookAppointment = (data) => API.post('/appointments', data);
export const getAppointments = () => API.get('/appointments');
export const updateAppointmentStatus = (id, status) => API.patch(`/appointments/${id}`, { status });

// Goals
export const getGoals = () => API.get('/goals');
export const createGoal = (data) => API.post('/goals', data);
export const updateGoal = (id, data) => API.put(`/goals/${id}`, data);
export const deleteGoal = (id) => API.delete(`/goals/${id}`);
export const validateGoal = (id) => API.post(`/goals/validate/${id}`);

// Risk
export const getRiskAnalysis = (portfolioId) => API.get(`/risk/${portfolioId}`);

// Calculators
export const calcSIP = (data) => API.post('/calculators/sip', data);
export const calcMutualFund = (data) => API.post('/calculators/mutual-fund', data);
export const calcFD = (data) => API.post('/calculators/fd', data);
export const calcEMI = (data) => API.post('/calculators/emi', data);

export default API;
