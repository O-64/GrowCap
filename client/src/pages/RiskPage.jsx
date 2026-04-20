import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPortfolios, getRiskAnalysis, getDiscoveryData, fetchOnboardingPlan } from '../services/api';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, TrendingDown, 
  PieChart as LucidePieChart, Loader2, BarChart3, 
  Sparkles, Fingerprint, Activity, Target, ArrowRight, Zap
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, Tooltip, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Legend 
} from 'recharts';

export default function RiskPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadRiskData(); 
  }, []);

  async function loadRiskData() {
    try {
      setLoading(true);
      const { data: discoveryData } = await getDiscoveryData().catch(() => ({ data: null }));
      setDiscovery(discoveryData);

      const { data: portfolios } = await getPortfolios();
      if (portfolios && portfolios.length > 0) {
        const { data } = await getRiskAnalysis(portfolios[0].id);
        setRisk(data);
      }
    } catch (err) { 
        console.error('Risk data load error:', err); 
    } finally { 
        setLoading(false); 
    }
  }

  const riskConfig = {
    low: { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Low Risk', gradient: 'from-emerald-500 to-teal-500' },
    medium: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate Risk', gradient: 'from-amber-500 to-orange-500' },
    high: { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', label: 'High Risk', gradient: 'from-rose-500 to-red-500' },
  };

  const strategyRiskConfig = {
    Low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    Moderate: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    High: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  const deviationConfig = {
    'On Track': { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ShieldCheck },
    'Moderate': { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
    'High': { color: 'text-rose-600', bg: 'bg-rose-50', icon: ShieldAlert },
  };

  const compositeRisk = risk?.riskScore || 'low';
  const config = riskConfig[compositeRisk] || riskConfig.low;
  const RiskIcon = config.icon;
  const devConfig = deviationConfig[risk?.deviationRisk || 'On Track'] || deviationConfig['On Track'];
  const DevIcon = devConfig.icon;
  const stratConfig = strategyRiskConfig[risk?.strategyRisk || 'Low'] || strategyRiskConfig.Low;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-text-muted font-medium animate-pulse">Analyzing risk factors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-indigo-950">Risk Command Center</h1>
            <p className="text-text-muted mt-1">Two-layer risk analysis: Strategy Base Risk + Portfolio Deviation Risk</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Profile: {user?.user_type}</span>
        </div>
      </div>

      {/* Layer 1: Strategy Risk + Layer 2: Deviation Risk — Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Base Risk */}
        <div className={`glass-card border-2 ${stratConfig.border} ${stratConfig.bg} p-6 relative overflow-hidden`}>
            <div className="absolute -right-8 -bottom-8 opacity-5">
                <Target className="w-48 h-48" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Target className={`w-5 h-5 ${stratConfig.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Layer 1 — Strategy Base Risk</span>
                </div>
                <h2 className={`text-3xl font-black mb-2 ${stratConfig.color}`}>{risk?.strategyRisk || 'N/A'}</h2>
                <p className="text-sm text-slate-600 font-medium mb-4">
                    Active Strategy: <span className="font-black text-indigo-950">{risk?.strategyName || 'None Selected'}</span>
                </p>
                {risk?.targetAllocation && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/50">
                    <div className="text-center p-2 bg-white/60 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Equity</p>
                      <p className="text-lg font-black text-indigo-950">{risk.targetAllocation.equity_pct}%</p>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Safe</p>
                      <p className="text-lg font-black text-indigo-950">{risk.targetAllocation.safe_pct}%</p>
                    </div>
                  </div>
                )}
            </div>
        </div>

        {/* Deviation Risk */}
        <div className={`glass-card border-2 ${config.border} ${config.bg} p-6 relative overflow-hidden`}>
            <div className="absolute -right-8 -bottom-8 opacity-5">
                <RiskIcon className="w-48 h-48" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className={`w-5 h-5 ${config.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Layer 2 — Portfolio Deviation</span>
                </div>
                <h2 className={`text-3xl font-black mb-2 ${devConfig.color}`}>{risk?.deviationRisk || 'On Track'}</h2>
                <p className="text-sm text-slate-600 font-medium mb-4">
                    Deviation from target: <span className={`font-black ${risk?.deviationPct > 20 ? 'text-rose-600' : risk?.deviationPct > 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{risk?.deviationPct || 0}%</span>
                </p>
                {risk?.actualAllocation && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/50">
                    <div className="text-center p-2 bg-white/60 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Actual Equity</p>
                      <p className="text-lg font-black text-indigo-950">{risk.actualAllocation.equity_pct}%</p>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Actual Safe</p>
                      <p className="text-lg font-black text-indigo-950">{risk.actualAllocation.safe_pct}%</p>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* Composite Risk Banner */}
      <div className={`glass-card border-2 ${config.border} p-4 flex items-center gap-4 bg-gradient-to-r ${config.gradient} text-white`}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <RiskIcon className="w-7 h-7" />
          </div>
          <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Composite Risk Level</p>
              <h3 className="text-2xl font-black">{config.label}</h3>
              <p className="text-xs opacity-80 font-medium">Combined analysis of strategy intent and portfolio reality</p>
          </div>
      </div>

      {risk && risk.holdingsCount > 0 ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-primary-light" />
                <span className="text-sm text-text-muted font-bold uppercase tracking-wider">Volatility</span>
              </div>
              <p className="text-3xl font-black text-indigo-950">{risk.volatility}%</p>
              <p className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-tighter">Market fluctuation sensitivity</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <LucidePieChart className="w-5 h-5 text-accent" />
                <span className="text-sm text-text-muted font-bold uppercase tracking-wider">Diversification</span>
              </div>
              <p className="text-3xl font-black text-indigo-950">{risk.diversificationScore}%</p>
              <p className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-tighter">Asset spread efficiency</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-danger" />
                <span className="text-sm text-text-muted font-bold uppercase tracking-wider">Max Drawdown</span>
              </div>
              <p className="text-3xl font-black text-danger">{risk.maxDrawdown}%</p>
              <p className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-tighter">Estimated peak-to-trough risk</p>
            </div>
          </div>

          {/* Target vs Actual Allocation Comparison */}
          {risk.targetAllocation && (
            <div className="glass-card">
              <h3 className="text-sm font-black text-indigo-950 mb-6 uppercase tracking-widest border-b border-border pb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Strategy Target vs Actual Portfolio
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Equity', target: risk.targetAllocation.equity_pct, actual: risk.actualAllocation.equity_pct, color: '#6366f1' },
                  { label: 'Safe Assets', target: risk.targetAllocation.safe_pct, actual: risk.actualAllocation.safe_pct, color: '#10b981' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-indigo-950">Target: {item.target}% • Actual: {item.actual}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
                      {/* Target line */}
                      <div className="absolute top-0 h-full w-0.5 bg-slate-800 z-10" style={{ left: `${Math.min(item.target, 100)}%` }} />
                      {/* Actual fill */}
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ 
                          width: `${Math.min(item.actual, 100)}%`, 
                          backgroundColor: Math.abs(item.actual - item.target) > 20 ? '#ef4444' : Math.abs(item.actual - item.target) > 10 ? '#f59e0b' : item.color 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Type Allocation */}
            <div className="glass-card">
                <h3 className="text-sm font-black text-indigo-950 mb-6 uppercase tracking-widest border-b border-border pb-4">Exposure by Asset Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                        <Pie
                            data={risk?.typeAllocation ? Object.entries(risk.typeAllocation).map(([type, value]) => ({ name: type.replace('_', ' '), value: parseFloat(value) })) : []}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {risk?.typeAllocation && Object.entries(risk.typeAllocation).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        </RePieChart>
                    </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                    {risk?.typeAllocation ? Object.entries(risk.typeAllocation).map(([type, value], index) => {
                        const pct = risk.totalValue > 0 ? ((value / risk.totalValue) * 100).toFixed(1) : 0;
                        const color = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5];
                        return (
                        <div key={type}>
                            <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wider">
                            <span className="flex items-center gap-2 text-slate-600">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                {type.replace('_', ' ')}
                            </span>
                            <span className="text-indigo-950">{pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                        </div>
                        );
                    }) : (
                        <div className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">No Type Data</div>
                    )}
                    </div>
                </div>
            </div>

            {/* Benchmarking */}
            <div className="glass-card">
                <h3 className="text-sm font-black text-indigo-950 mb-6 uppercase tracking-widest border-b border-border pb-4">Benchmarking Analysis</h3>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                    data={[
                        { name: 'Vol.', current: risk.volatility, benchmark: 15 },
                        { name: 'Div.', current: risk.diversificationScore, benchmark: 70 },
                        { name: 'Draw.', current: risk.maxDrawdown, benchmark: 10 }
                    ]}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 11, fontWeight: 700 }} />
                    <Bar dataKey="current" name="Your Portfolio" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="benchmark" name="Market Standard" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* AI Audit */}
          {(discovery?.ai_suggestion || risk.recommendations?.length > 0) && (
            <div className="glass-card border-indigo-100 bg-indigo-50/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Risk Recommendations</h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-tighter shadow-sm">Live Analysis</span>
                </div>
                
                <div className="space-y-2">
                    {(risk.recommendations || []).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                         <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${rec.includes('CRITICAL') ? 'bg-rose-500' : rec.includes('well-aligned') ? 'bg-emerald-500' : 'bg-indigo-400'}`} />
                         <span>{rec}</span>
                      </div>
                    ))}
                </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card text-center py-20 bg-slate-50/30 border-dashed border-2">
          <ShieldAlert className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-400">No Investments Yet</h3>
          <p className="text-text-muted max-w-xs mx-auto mt-2 font-medium">Add investments to your portfolio to see how your allocation compares to your selected strategy.</p>
          <button 
            onClick={() => navigate('/dashboard/portfolio')}
            className="mt-6 px-6 py-2 bg-indigo-900 text-white rounded-xl font-bold text-sm shadow-indigo-100 shadow-xl flex items-center gap-2 mx-auto"
          >
            Go to Portfolio <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
