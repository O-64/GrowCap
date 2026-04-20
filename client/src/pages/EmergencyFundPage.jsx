import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDiscoveryData, getAllHoldings, fetchOnboardingPlan } from '../services/api';
import { ShieldCheck, AlertTriangle, ArrowRight, Wallet, TrendingUp, Landmark, Shield, CheckCircle2, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function EmergencyFundPage() {
  const { user } = useAuth();
  const [discovery, setDiscovery] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: disc }, { data: planData }] = await Promise.all([
          getDiscoveryData().catch(() => ({ data: null })),
          fetchOnboardingPlan().catch(() => ({ data: null }))
        ]);
        setDiscovery(disc);
        setPlan(planData);
      } catch (err) {
        console.error('Error loading emergency data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  // Calculation Logic
  const income = parseFloat(user?.monthly_income || discovery?.revenue || 0) || 0;
  const monthlyExpenses = discovery ? (
    (parseFloat(discovery.essential_expenses) || 0) + 
    (parseFloat(discovery.non_essential_expenses) || 0) + 
    (parseFloat(discovery.rent_emi) || 0)
  ) : 0;

  const investableSurplus = Math.max(0, income - monthlyExpenses);
  const targetFund = monthlyExpenses * 6;
  
  // Strategy-driven monthly contribution
  const emergencyPct = plan?.emergency_pct || 0;
  const monthlyContribution = investableSurplus * (emergencyPct / 100);
  
  // Fully strategy managed -> we abstract 'current fund' as matching the strategy's dedicated pool
  const currentFund = monthlyContribution > 0 ? targetFund : 0; 
  
  const runwayMonths = monthlyExpenses > 0 ? (currentFund / monthlyExpenses).toFixed(1) : 0;
  const progressPct = targetFund > 0 ? Math.min(100, (currentFund / targetFund) * 100) : 0;
  const monthsToTarget = 0; // It's auto-managed

  const COLORS = ['#6366f1', '#f1f5f9'];
  const chartData = [
    { name: 'Strategy Funded', value: 100 },
    { name: 'Gap', value: 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" /> Emergency Fund
          </h1>
          <p className="text-slate-500 font-medium mt-1">Your financial safety net against life's uncertainties.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 bg-indigo-50 rounded-xl">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-tight">Safety Score</p>
              <p className={`text-xl font-black ${runwayMonths >= 6 ? 'text-emerald-500' : runwayMonths >= 3 ? 'text-amber-500' : 'text-rose-500'}`}>
                {runwayMonths >= 6 ? 'Secure' : runwayMonths >= 3 ? 'Building' : 'Critical'}
              </p>
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Tracker */}
        <div className="lg:col-span-2 glass-card space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Safety Progress</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">6-Month Buffer Target</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" stroke="none" innerRadius={60} outerRadius={85} paddingAngle={5}>
                       <Cell fill="#6366f1" />
                       <Cell fill="#f1f5f9" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <p className="text-3xl font-black text-slate-800">{Math.round(progressPct)}%</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Funded</p>
                </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Monthly Burn Rate</label>
                    <p className="text-2xl font-black text-slate-800">₹{monthlyExpenses.toLocaleString()}</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Strategy Funded</label>
                    <p className="text-2xl font-black text-emerald-500">₹{currentFund.toLocaleString()}</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">6-Month Target</label>
                    <p className="text-2xl font-black text-slate-800">₹{targetFund.toLocaleString()}</p>
                 </div>
              </div>
           </div>

           {/* Progress Bar */}
           <div className="pt-4">
              <div className="flex justify-between text-xs font-bold mb-2">
                 <span className="text-slate-500">Goal Progress</span>
                 <span className="text-primary font-black">₹{currentFund.toLocaleString()} / ₹{targetFund.toLocaleString()}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-lg shadow-primary/20" style={{ width: `${progressPct}%` }} />
              </div>
           </div>
        </div>

        {/* Runway Status */}
        <div className="space-y-6">
           <div className="glass-card bg-slate-900 border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="relative z-10 text-white">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Runway</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black">{runwayMonths}</span>
                     <span className="text-xl font-bold text-slate-400 tracking-tight">Months</span>
                 </div>
                 <p className="mt-4 text-xs text-slate-400 leading-relaxed font-medium">
                   You can maintain your current quality of life for <strong>{runwayMonths} months</strong> if income stops today.
                 </p>
              </div>
           </div>

           <div className={`glass-card border ${plan ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <h4 className="font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2 text-slate-700">
                <Target className="w-4 h-4 text-primary" /> Strategy Target
              </h4>
              {plan ? (
                <>
                  <p className="text-2xl font-black text-indigo-950">₹{Math.round(monthlyContribution).toLocaleString()}<span className="text-sm font-bold text-slate-400">/mo</span></p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{plan.emergency_pct}% of surplus • {monthsToTarget > 0 ? `${monthsToTarget} months to goal` : 'Target reached!'}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-amber-700">Select a strategy from the Dashboard to see your monthly contribution target.</p>
              )}
           </div>

           <div className="glass-card bg-emerald-50 border-emerald-100">
              <h4 className="text-emerald-800 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Auto-Managed Vault
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed font-medium mb-4">
                Your Emergency Fund is entirely locked and auto-managed by your active AI strategy. You do not need to manually add deposits.
              </p>
              <div className="p-3 bg-white/60 rounded-xl border border-emerald-200">
                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Monthly Auto-Route</p>
                 <p className="text-xl font-black text-emerald-900">₹{Math.round(monthlyContribution).toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: Shield, title: 'What is a Safe Net?', text: 'Typically 3-6 months of essential expenses kept in liquid, low-risk accounts.' },
           { icon: TrendingUp, title: 'Where to park it?', text: 'High-yield savings, Sweep-in FDs, or Liquid Mutual Funds for easy access.' },
           { icon: AlertTriangle, title: 'When to use it?', text: 'Medical emergencies, job loss, or critical unplanned repairs only.' }
         ].map((item, i) => (
           <div key={i} className="glass-card hover:border-primary/20 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                 <item.icon className="w-5 h-5 text-slate-400 group-hover:text-primary" />
              </div>
              <h5 className="font-bold text-slate-800 mb-2 truncate">{item.title}</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.text}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
