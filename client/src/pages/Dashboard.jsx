import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getPortfolios, getPortfolioSummary, createPortfolio,
  getAppointments, getDiscoveryData, completeOnboarding, applyStrategy, fetchOnboardingPlan 
} from '../services/api';
import { 
  TrendingUp, TrendingDown, PieChart, Wallet, Target, 
  BarChart3, ArrowUpRight, ArrowDownRight, CheckCircle2, 
  LayoutDashboard, ShieldAlert, Loader2, Calendar, 
  AlertCircle, Sparkles, Phone, Clock, Trophy, Zap, Shield, ShieldCheck, IndianRupee
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import DiscoveryForm from '../components/DiscoveryForm';
import AppointmentCard from '../components/AppointmentCard';
import { Settings, X } from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgeBasedStrategies } from '../services/strategies';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [discovery, setDiscovery] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [applyingStrategy, setApplyingStrategy] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ monthly_income: 0, essential_expenses: 0, non_essential_expenses: 0, rent_emi: 0, tax_liability: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!loading && discovery) {
      // Simulate AI generation every time user lands if it's a fresh transition or update
      setIsGenerating(true);
      const timer = setTimeout(() => setIsGenerating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, discovery?.id]);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    try {
      setLoading(true);
      // Check discovery status
      const { data: discoveryData } = await getDiscoveryData().catch(() => ({ data: null }));
      setDiscovery(discoveryData);
      
      if (!user?.onboarding_completed) {
        setShowDiscovery(true);
      }

      // Fetch appointments and active plan
      const { data: appts } = await getAppointments().catch(() => ({ data: [] }));
      setAppointments(appts || []);
      const { data: planData } = await fetchOnboardingPlan().catch(() => ({ data: null }));
      setActivePlan(planData);

      // Fetch financial summary
      let { data: portfolios } = await getPortfolios().catch(() => ({ data: [] }));
      
      // Auto-initialize default portfolio if missing
      if (!portfolios || portfolios.length === 0) {
        await createPortfolio({ name: 'Main Portfolio', description: 'Primary investment bucket' });
        const res = await getPortfolios().catch(() => ({ data: [] }));
        portfolios = res.data;
      }

      if (portfolios && portfolios.length > 0) {
        const { data } = await getPortfolioSummary(portfolios[0].id).catch(() => ({ data: null }));
        setSummary(data);
      }
      

    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDiscoveryComplete = async () => {
    // Rely on refreshUser to trigger the useEffect via user dependency update
    await refreshUser();
    setShowDiscovery(false);
  };

  const getRuleOf100 = () => {
    if (!discovery?.birth_date) return null;
    const age = new Date().getFullYear() - new Date(discovery.birth_date).getFullYear();
    const equityPct = 100 - age;
    return { age, equityPct };
  };

  const ruleData = getRuleOf100();

  // Find active appointment for alert
  const activeAppointment = appointments.find(a => {
    const apptTime = new Date(`${a.appointment_date}T${a.appointment_time}`);
    const now = new Date();
    const diff = (now - apptTime) / (1000 * 60);
    return diff >= -15 && diff <= 45;
  });

  const allocationData = summary ? Object.entries(summary.summary.allocationPercent)
    .filter(([_, v]) => parseFloat(v) > 0)
    .map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value: parseFloat(value) })) : [];

  const handleApplyStrategy = async (strategy) => {
    // Validation: Net Cash > 0
    if (income - fixedExpenses <= 0) {
       alert('Validation Failed: You do not have enough Available Cash to apply an investment strategy. Please clear up your fixed budget first.');
       return;
    }

    try {
      setApplyingStrategy(strategy.name);
      await applyStrategy(strategy);
      await refreshUser();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to apply strategy.');
    } finally {
      setApplyingStrategy(null);
    }
  };

  const handleOpenEditProfile = () => {
    setEditForm({
      monthly_income: parseFloat(user?.monthly_income || discovery?.monthly_income || 0),
      essential_expenses: parseFloat(discovery?.essential_expenses || 0),
      non_essential_expenses: parseFloat(discovery?.non_essential_expenses || 0),
      rent_emi: parseFloat(discovery?.rent_emi || 0),
      other_needs: parseFloat(discovery?.other_needs || 0),
      revenue: parseFloat(discovery?.revenue || 0),
      payroll: parseFloat(discovery?.payroll || 0),
      opex: parseFloat(discovery?.opex || 0),
      tax_liability: parseFloat(discovery?.tax_liability || 0),
      birth_date: discovery?.birth_date || user?.birth_date || ''
    });
    setShowEditProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // We will make a backend call to update discovery mapping
      const { updateDiscoveryProfile } = await import('../services/api');
      await updateDiscoveryProfile(editForm);
      setShowEditProfile(false);
      await loadDashboard();
      alert('Profile updated and AI Risk assessment recalibrated.');
    } catch (err) {
      console.error('Update profile error', err);
      alert('Failed to update profile');
    }
  };



  const userAge = React.useMemo(() => {
    if (user?.birth_date) {
      return new Date().getFullYear() - new Date(user.birth_date).getFullYear();
    }
    return 30;
  }, [user]);

  // Plan-driven monthly amounts
  // Savings & Surplus Calculation
  const isBusiness = user?.user_type === 'business';
  
  // Base Income: Revenue for Business, monthly_income for individual
  const income = isBusiness 
    ? parseFloat(user?.revenue || discovery?.revenue || 0)
    : parseFloat(user?.monthly_income || discovery?.monthly_income || 0);

  // Fixed Commitments / Spends
  const fixedExpenses = isBusiness
    ? (parseFloat(user?.payroll || discovery?.payroll || 0) + parseFloat(user?.opex || discovery?.opex || 0) + parseFloat(user?.tax_liability || discovery?.tax_liability || 0))
    : (parseFloat(discovery?.essential_expenses || 0) + parseFloat(discovery?.rent_emi || 0) + parseFloat(discovery?.other_needs || 0) + parseFloat(discovery?.non_essential_expenses || 0));
  
  // Available Cash (For Investment) is the amount AFTER fixed commitments
  const investableSurplus = Math.max(0, income - fixedExpenses);
  
  // Plan-driven allocations (Now calculated as % of AVAILABLE CASH)
  const planEquity = activePlan ? (investableSurplus * activePlan.equity_pct / 100) : 0;
  const planSafe = activePlan ? (investableSurplus * activePlan.safe_pct / 100) : 0;
  const planEmergency = activePlan ? (investableSurplus * activePlan.emergency_pct / 100) : 0;
  const planRetirement = activePlan ? (investableSurplus * activePlan.retirement_pct / 100) : 0;
  
  const planInvestmentTotal = planEquity + planSafe + planEmergency + planRetirement;
  
  // Savings metrics
  const totalSavingsLeft = Math.max(0, income - fixedExpenses);
  const grossSavings = Math.max(0, income - fixedExpenses); 
  const netSavings = Math.max(0, totalSavingsLeft - planInvestmentTotal);

  const currentSafeAssets = summary?.holdings?.filter(h => h.type === 'fd')?.reduce((sum, h) => sum + parseFloat(h.current_value || h.invested_amount), 0) || 0;
  const runwayMonths = fixedExpenses > 0 ? (currentSafeAssets / fixedExpenses).toFixed(1) : 0;

  const monthlyExpenses = fixedExpenses; // Aliasing for the UI card

  const STRATEGIES = getAgeBasedStrategies(userAge);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-text-muted font-medium animate-pulse">Gathering financial insights...</p>
      </div>
    );
  }

  if (showDiscovery) {
    return (
      <div className="py-10">
        <DiscoveryForm onComplete={handleDiscoveryComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Live Appointment Alert */}
      {activeAppointment && (
        <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-glow border border-indigo-400/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-lg">Your Session is LIVE!</h4>
              <p className="text-indigo-100 text-sm">Expert {activeAppointment.advisor_name} is waiting for you.</p>
            </div>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
             Join Now
          </button>
        </div>
      )}

      {/* Advisory Alerts & Rules (INDIVIDUAL ONLY) */}
      {user?.user_type === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ruleData && (
            <div className="glass-card bg-primary/5 border-primary/20 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <PieChart className="w-24 h-24 rotate-12" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0">
                    <Target className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-950">Rule of 100-Age</h4>
                    <p className="text-sm text-slate-600">Based on your age ({ruleData.age}), your Advisor suggests <span className="font-bold text-primary">{ruleData.equityPct}%</span> in Equity allocation.</p>
                </div>
            </div>
          )}
          {summary?.summary?.pnlPercent < 0 && (
             <div className="glass-card bg-danger/5 border-danger/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-danger flex items-center justify-center text-white shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-danger">Expensive Goal Risk</h4>
                    <p className="text-sm text-slate-600">Some of your premium goals are at risk due to portfolio volatility. Review your allocation.</p>
                </div>
             </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-950 flex items-center gap-2">Welcome back, <span className="glow-text">{user?.name}</span> 👋 
             <button onClick={handleOpenEditProfile} className="ml-2 hover:bg-slate-200 p-1.5 rounded-full transition tooltip" title="Edit Profile">
                 <Settings className="w-5 h-5 text-slate-500" />
             </button>
          </h1>
          <p className="text-text-muted mt-1">Here is your {user?.user_type === 'business' ? 'Financial Manager' : 'Advisor'} dashboard overview</p>
        </div>
        <div className="flex items-center gap-3 p-2 bg-surface-lighter rounded-2xl">
            <span className="text-xs font-bold text-text-muted px-2 border-r border-border uppercase tracking-widest">{user?.user_type}</span>
            <div className="flex items-center gap-2 pr-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-success">AI SYNCED</span>
            </div>
        </div>
      </div>

      {/* Stat Cards — Plan-driven target values */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="stat-card bg-emerald-50 border-emerald-200 border">
          <div className="flex items-center justify-between mb-3 text-sm text-emerald-800 font-bold uppercase tracking-wider">
            <span>Monthly Income</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-950">₹{income.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-emerald-700 mt-2">Available Surplus: ₹{investableSurplus.toLocaleString()}</p>
        </div>

        <div className={`stat-card border ${discovery?.ai_risk_score === 'High' ? 'bg-rose-50 border-rose-200' : discovery?.ai_risk_score === 'Low' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-3 text-sm font-bold uppercase tracking-wider">
            <span className="text-slate-700">AI Risk Score</span>
            <ShieldAlert className={`w-4 h-4 ${discovery?.ai_risk_score === 'High' ? 'text-rose-500' : discovery?.ai_risk_score === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
          <p className={`text-2xl font-black ${discovery?.ai_risk_score === 'High' ? 'text-rose-600' : discovery?.ai_risk_score === 'Low' ? 'text-emerald-600' : 'text-amber-600'}`}>{discovery?.ai_risk_score || 'Pending'}</p>
          <p className="text-[10px] font-bold text-text-muted mt-2">Synced with Risk Center</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3 text-sm text-text-muted font-bold uppercase tracking-wider">
            <span>Portfolio Value</span>
            <BarChart3 className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-black text-indigo-950">₹{(summary?.summary?.totalCurrent || 0).toLocaleString()}</p>
          {activePlan && <p className="text-[10px] font-bold text-text-muted mt-2">Equity Target: ₹{planEquity.toLocaleString()}/mo ({activePlan.equity_pct}%)</p>}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3 text-sm text-text-muted font-bold uppercase tracking-wider">
            <span>Returns</span>
            {(summary?.summary?.totalPnL || 0) >= 0 ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-danger" />}
          </div>
          <p className="text-[10px] font-bold text-text-muted mt-2">{(summary?.summary?.pnlPercent || 0)}% Return on Equity</p>
        </div>

        <div className="stat-card bg-emerald-950 border-emerald-900 border">
          <div className="flex items-center justify-between mb-3 text-sm text-emerald-300 font-bold uppercase tracking-wider">
            <span>Investable Surplus</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">₹{investableSurplus.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-emerald-400/80 mt-1 uppercase tracking-widest">
            Total Savings After Spendings
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3 text-sm text-text-muted font-bold uppercase tracking-wider">
            <span>Monthly Spends</span>
            <AlertCircle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-black text-indigo-950">₹{fixedExpenses.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-text-muted mt-2">Fixed Discovered Load: ₹{fixedExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Strategic Action Hub — shows AFTER discovery */}
      {discovery && (
        <div className="animate-fade-in space-y-4 mb-2">
            
            {/* Active Strategy Overview Breakdown */}
            {activePlan && (
              <div className="mb-8">
                 <div className="glass-card border-none bg-gradient-to-br from-indigo-900 to-slate-900 p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />
                     <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <Target className="w-5 h-5 text-primary-light" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Active Strategy Directives</span>
                        </div>
                        <h2 className="text-3xl font-black mb-1 text-white">{activePlan.strategy_name || 'Custom Focus Plan'}</h2>
                        <p className="text-sm text-indigo-200 mb-8 max-w-xl leading-relaxed">
                          Based on your investable surplus of <strong className="text-white">₹{investableSurplus.toLocaleString()}</strong>, here is exactly where your money needs to go every month to stay on track.
                        </p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all cursor-default relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-16 h-16 bg-primary-light/20 blur-xl group-hover:scale-150 transition-all" />
                              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Equity ({activePlan.equity_pct}%)</p>
                              <p className="text-2xl font-black text-white">₹{Math.round(investableSurplus * activePlan.equity_pct / 100).toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-indigo-300 mt-2">Stocks & Mutual Funds</p>
                           </div>
                           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all cursor-default relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-16 h-16 bg-cyan-400/20 blur-xl group-hover:scale-150 transition-all" />
                              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Safe Assets ({activePlan.safe_pct}%)</p>
                              <p className="text-2xl font-black text-white">₹{Math.round(investableSurplus * activePlan.safe_pct / 100).toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-indigo-300 mt-2">Fixed Deposits & Cash</p>
                           </div>
                           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-amber-400/30 hover:bg-white/20 transition-all cursor-default relative overflow-hidden group shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                              <div className="absolute right-0 top-0 w-16 h-16 bg-amber-400/20 blur-xl group-hover:scale-150 transition-all" />
                              <p className="text-[10px] font-bold text-amber-200 uppercase tracking-widest mb-1 flex items-center justify-between">
                                 <span>Emergency ({activePlan.emergency_pct}%)</span>
                                 <span className="text-[8px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">6mo Runway Target</span>
                              </p>
                              <p className="text-2xl font-black text-amber-400">₹{Math.round(investableSurplus * activePlan.emergency_pct / 100).toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-amber-200/70 mt-2">Short-term Safety Net</p>
                           </div>
                           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-emerald-400/30 hover:bg-white/20 transition-all cursor-default relative overflow-hidden group shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                              <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-400/20 blur-xl group-hover:scale-150 transition-all" />
                              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Retirement ({activePlan.retirement_pct}%)</p>
                              <p className="text-2xl font-black text-emerald-400">₹{Math.round(investableSurplus * activePlan.retirement_pct / 100).toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-emerald-200/70 mt-2">Long-term Lock-in</p>
                           </div>
                        </div>
                     </div>
                 </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <Target className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-indigo-950 uppercase tracking-tight">Financial Plans</h2>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                      {isGenerating ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-primary"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing your financial DNA...
                        </motion.span>
                      ) : (
                        "Select a safe, AI-recommended plan — all sections update instantly"
                      )}
                    </p>
                 </div>
              </div>
              
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40"
                  >
                    <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" />
                    AI is Computing Optimal Risk
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
               {isGenerating && (
                 <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl">
                    <motion.div 
                      initial={{ y: '-100%' }}
                      animate={{ y: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-full h-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent blur-xl"
                    />
                 </div>
               )}
               
               {STRATEGIES.map((strat, index) => {
                 const Icon = strat.icon;
                 const isActive = activePlan && parseFloat(activePlan.equity_pct) === strat.plan.equity_pct && parseFloat(activePlan.safe_pct) === strat.plan.safe_pct;
                 const isApplying = applyingStrategy === strat.name;
                 return (
                  <motion.div 
                    key={strat.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={!isGenerating ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.2, y: 10, scale: 0.98 }}
                    transition={{ 
                      delay: !isGenerating ? index * 0.15 : 0,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    className={`glass-card transition-all flex flex-col justify-between ${isActive ? 'border-2 border-primary shadow-lg shadow-primary/10 bg-primary/5' : 'border-dashed border-2 hover:border-primary/40'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${strat.color} flex items-center justify-center text-white shadow-lg`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${strat.inherentRisk === 'High' ? 'bg-rose-100 text-rose-600' : strat.inherentRisk === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{strat.inherentRisk} Risk</span>
                          {isActive && <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">✓ ACTIVE</span>}
                        </div>
                      </div>
                      <h4 className="font-black text-indigo-900 mb-1">{strat.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3">{strat.desc}</p>
                      
                      {/* Plan breakdown relative to AVAILABLE CASH */}
                      <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-2 border-b border-indigo-50 leading-loose">Allocating Cash (₹{investableSurplus.toLocaleString()})</p>
                      <div className="space-y-1.5 mb-2">
                        {[
                          { label: 'Equity', pct: strat.plan.equity_pct, amt: investableSurplus * strat.plan.equity_pct / 100 },
                          { label: 'Safe Assets', pct: strat.plan.safe_pct, amt: investableSurplus * strat.plan.safe_pct / 100 },
                          { label: 'Emergency', pct: strat.plan.emergency_pct, amt: investableSurplus * strat.plan.emergency_pct / 100 },
                          { label: 'Retirement', pct: strat.plan.retirement_pct, amt: investableSurplus * strat.plan.retirement_pct / 100 },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">{item.label} ({item.pct}%)</span>
                            <span className="text-[10px] font-black text-indigo-950">₹{item.amt.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleApplyStrategy({ ...strat.plan, name: strat.name })}
                      disabled={isActive || isApplying}
                      className={`mt-4 w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-sm flex items-center justify-center gap-2 ${isActive ? 'bg-primary text-white border-2 border-primary cursor-default' : 'border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white'}`}
                    >
                      {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {isActive ? '✓ Currently Applied' : isApplying ? 'Applying...' : 'Apply This Plan'}
                    </button>
                  </motion.div>
                 );
               })}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card">
                <h3 className="text-sm font-black text-indigo-950 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" /> Asset Allocation
                </h3>
                <div className="h-64">
                {allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} strokeWidth={0}>
                        {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#ffffff', border: 'none', borderRadius: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </RePieChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <PieChart className="w-12 h-12 text-slate-200 mb-2" />
                    <p className="text-xs text-text-muted">Add investments to see allocation</p>
                  </div>
                )}
                </div>
              </div>

              <div className="glass-card">
                <h3 className="text-sm font-black text-indigo-950 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Emergency Runway
                </h3>
                <div className="h-48 flex items-center justify-center p-6 bg-slate-900 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                  <div className="text-center relative z-10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Current Survival Buffer</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-white">{runwayMonths}</span>
                      <span className="text-xl font-bold text-slate-500">Months</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-4 max-w-[140px] mx-auto uppercase tracking-tighter leading-tight">
                       Based on {monthlyExpenses.toLocaleString()} Fixed Monthly Burn
                    </p>
                  </div>
                </div>
              </div>
           </div>

           {/* AI Insight Card */}
           <div className="glass-card bg-indigo-950 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                 <Sparkles className="w-5 h-5 text-rose-400" />
                 <h3 className="font-bold text-lg">AI Advisor Insights</h3>
               </div>
               <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                 {discovery?.ai_suggestion 
                   ? (discovery.ai_suggestion.length > 200 ? discovery.ai_suggestion.substring(0, 197) + '...' : discovery.ai_suggestion)
                   : "Complete your discovery profile to see personalized AI insights and optimization tips."}
               </p>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Risk Score</p>
                    <p className={`font-black ${discovery?.ai_risk_score === 'High' ? 'text-rose-400' : discovery?.ai_risk_score === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>{discovery?.ai_risk_score || 'N/A'}</p>
                 </div>
                 <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Monthly Income</p>
                    <p className="font-black text-emerald-400">₹{income.toLocaleString()}</p>
                 </div>
                 {activePlan && (
                   <>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Plan Equity</p>
                      <p className="font-black text-cyan-400">{activePlan.equity_pct}%</p>
                   </div>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Plan Safety</p>
                      <p className="font-black text-emerald-400">{activePlan.safe_pct}%</p>
                   </div>
                   </>
                 )}
               </div>
             </div>
           </div>
        </div>

        {/* Upcoming Appointments Sidebar */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-primary" /> Session Calendar
              </h3>
              <button onClick={() => navigate('/dashboard/contact')} className="text-xs font-bold text-primary hover:underline">Book New</button>
           </div>
           
           {appointments.length > 0 ? (
             <div className="space-y-4">
                {appointments.slice(0, 3).map(appt => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
             </div>
           ) : (
             <div className="glass-card text-center py-10">
                <Clock className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-text-muted font-medium">No upcoming sessions</p>
                <button 
                  onClick={() => navigate('/dashboard/contact')}
                  className="mt-4 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-all"
                >
                  Schedule an Expert
                </button>
             </div>
           )}

           <div className="glass-card border-dashed border-2 flex flex-col items-center justify-center py-8 text-center bg-slate-50/50">
             <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Premium Support</p>
             <p className="text-xs text-slate-400 mt-1 max-w-[180px]">Access priority auditing and 1-on-1 calls with specialists.</p>
           </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-8" 
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(30,41,59,0.25)] overflow-hidden flex flex-col md:flex-row relative" 
              onClick={e => e.stopPropagation()}
            >
              {/* Sidebar Info */}
              <div className="md:w-1/3 bg-indigo-950 p-8 lg:p-10 text-white flex flex-col justify-between relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                   <div className="absolute top-10 right-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
                   <div className="absolute bottom-10 left-10 w-32 h-32 bg-rose-500 rounded-full blur-3xl" />
                </div>
                
                <div className="relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                      <Settings className="w-6 h-6 text-primary-light" />
                   </div>
                   <h3 className="text-3xl font-black mb-4">Financial Profile</h3>
                   <p className="text-indigo-300 text-sm leading-relaxed mb-8">
                     Updating these values will trigger a complete <span className="text-white font-bold">AI Recalibration</span> of your risk score and investment strategies.
                   </p>
                </div>

                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <Sparkles className="w-5 h-5 text-rose-400" />
                      <div>
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">AI Logic</p>
                         <p className="text-xs font-bold text-white">Dynamic Asset Rebalancing</p>
                      </div>
                   </div>
                   <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest text-center">Managed by GrowCap AI</p>
                </div>
              </div>

              {/* Form Area */}
              <div className="flex-1 p-8 lg:p-12 relative flex flex-col max-h-[90vh]">
                <button 
                  onClick={() => setShowEditProfile(false)} 
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition group"
                >
                  <X className="w-6 h-6 text-slate-400 group-hover:text-indigo-950"/>
                </button>

                <div className="mb-8">
                   <h4 className="text-2xl font-black text-indigo-950 mb-1">Core Metrics</h4>
                   <p className="text-slate-500 text-sm font-medium">Keep your monthly cashflow data current.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                          {user?.user_type === 'business' ? 'Monthly Revenue' : 'Monthly Income'}
                        </label>
                        <div className="relative group">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600" />
                          <input 
                             type="number" 
                             value={user?.user_type === 'business' ? editForm.revenue : editForm.monthly_income} 
                             onChange={e => setEditForm({...editForm, [user?.user_type === 'business' ? 'revenue' : 'monthly_income']: e.target.value})} 
                             className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-indigo-950" 
                             required 
                          />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600" />
                          <input 
                             type="date" 
                             value={editForm.birth_date} 
                             onChange={e => setEditForm({...editForm, birth_date: e.target.value})} 
                             className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800" 
                          />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ArrowDownRight className="w-3 h-3" /> Monthly Commitments
                     </p>
                    
                     {user?.user_type === 'business' ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Payroll Costs</label>
                            <input type="number" value={editForm.payroll} onChange={e => setEditForm({...editForm, payroll: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" />
                         </div>
                         <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">OpEx</label>
                            <input type="number" value={editForm.opex} onChange={e => setEditForm({...editForm, opex: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" />
                         </div>
                       </div>
                     ) : (
                       <>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Rent / EMI</label>
                              <input type="number" value={editForm.rent_emi} onChange={e => setEditForm({...editForm, rent_emi: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" />
                           </div>
                           <div className="space-y-2">
                              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Essential Spends</label>
                              <input type="number" value={editForm.essential_expenses} onChange={e => setEditForm({...editForm, essential_expenses: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" />
                           </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Non-Essential</label>
                              <input type="number" value={editForm.non_essential_expenses} onChange={e => setEditForm({...editForm, non_essential_expenses: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" />
                           </div>
                           <div className="space-y-2">
                              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Other Planned Needs</label>
                              <input type="number" value={editForm.other_needs} onChange={e => setEditForm({...editForm, other_needs: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" />
                           </div>
                         </div>
                       </>
                     )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Annual Tax Liability</label>
                    <div className="relative group">
                       <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600" />
                       <input type="number" value={editForm.tax_liability} onChange={e => setEditForm({...editForm, tax_liability: e.target.value})} className="w-full h-12 pl-12 pr-4 bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-indigo-950" />
                    </div>
                  </div>

                  <div className="pt-6">
                     <button type="submit" className="w-full h-14 bg-indigo-950 text-white font-black rounded-2xl hover:bg-slate-900 shadow-2xl shadow-indigo-950/20 transition-all flex items-center justify-center gap-3">
                        Recalibrate AI Strategies <Sparkles className="w-5 h-5 text-rose-400" />
                     </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
