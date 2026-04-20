import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Core Pages (shared by both user types)
import Dashboard from './pages/Dashboard';
import PortfolioPage from './pages/PortfolioPage';
import MarketPage from './pages/MarketPage';
import CalculatorsPage from './pages/CalculatorsPage';
import EmergencyFundPage from './pages/EmergencyFundPage';
import GoalsPage from './pages/GoalsPage';
import RiskPage from './pages/RiskPage';
import ProfilePage from './pages/ProfilePage';
import RetirementPage from './pages/RetirementPage';
import TaxManagementPage from './pages/TaxManagementPage';

// Shared UI
import AIAssistantPage from './pages/AIAssistantPage';
import ContactPage from './pages/ContactPage';

import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-xl text-text-muted">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      {/* Protected App Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* Core Modules - accessible to ALL users */}
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="calculators" element={<CalculatorsPage />} />
        <Route path="emergency" element={<EmergencyFundPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="risk" element={<RiskPage />} />
        <Route path="tax" element={<TaxManagementPage />} />
        <Route path="retirement" element={<RetirementPage />} />
        <Route path="ai" element={<AIAssistantPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
