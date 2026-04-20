import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDiscoveryData, fetchOnboardingPlan } from '../services/api';
import { Clock, Target, TrendingUp, Sparkles, IndianRupee, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function RetirementPage() {
  const { user } = useAuth();
  const [discovery, setDiscovery] = useState(null);
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState({
    current_age: '',
    retirement_age: 60,
    monthly_expenses: '',
    current_savings: '',
    monthly_investment: '',
    expected_return: 12,
    inflation: 6,
  });
  const [projection, setProjection] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: dData }, { data: pData }] = await Promise.all([
           getDiscoveryData().catch(() => ({ data: null })),
           fetchOnboardingPlan().catch(() => ({ data: null }))
        ]);
        
        setDiscovery(dData);
        setPlan(pData);
        
        if (dData) {
          const birthDate = dData.birth_date || user?.birth_date;
          const age = birthDate ? new Date().getFullYear() - new Date(birthDate).getFullYear() : 30;
          
          const income = parseFloat(user?.monthly_income) || parseFloat(dData.revenue) || 0;
          const fixedExpenses = (parseFloat(dData.essential_expenses) || 0) + (parseFloat(dData.non_essential_expenses) || 0) + (parseFloat(dData.rent_emi) || 0) + (parseFloat(dData.other_needs) || 0);
          const surplus = Math.max(0, income - fixedExpenses);
          
          const retirementPct = pData?.retirement_pct || 15;
          const strategicInvestment = surplus * (retirementPct / 100);

          setForm(prev => ({
            ...prev,
            current_age: age,
            monthly_expenses: fixedExpenses || '',
            monthly_investment: Math.round(strategicInvestment),
          }));
        }
      } catch (err) { console.error(err); }
    }
    load();
  }, [user]);

  function calculateProjection() {
    const { current_age, retirement_age, monthly_expenses, current_savings, monthly_investment, expected_return, inflation } = form;
    const years = retirement_age - current_age;
    if (years <= 0) return;

    const monthlyReturn = expected_return / 100 / 12;
    const monthlyInflation = inflation / 100 / 12;
    
    // Future monthly expenses at retirement (inflation adjusted)
    const futureMonthlyExpenses = monthly_expenses * Math.pow(1 + inflation / 100, years);
    
    // Required corpus (25x annual expenses - 4% rule)
    const requiredCorpus = futureMonthlyExpenses * 12 * 25;

    // Project savings growth
    const chartData = [];
    let savings = parseFloat(current_savings) || 0;

    for (let y = 0; y <= years; y++) {
      chartData.push({
        age: current_age + y,
        savings: Math.round(savings),
        required: Math.round(requiredCorpus),
      });
      // Compound monthly
      for (let m = 0; m < 12; m++) {
        savings = savings * (1 + monthlyReturn) + parseFloat(monthly_investment);
      }
    }

    const finalSavings = chartData[chartData.length - 1]?.savings || 0;
    const gap = requiredCorpus - finalSavings;
    const isOnTrack = finalSavings >= requiredCorpus;

    setProjection({
      chartData,
      requiredCorpus,
      projectedCorpus: finalSavings,
      gap,
      isOnTrack,
      futureMonthlyExpenses,
      yearsToRetirement: years,
    });
  }

  useEffect(() => {
    if (form.current_age && form.monthly_expenses && form.monthly_investment) {
      calculateProjection();
    }
  }, [form]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Retirement Planning</h1>
        <p className="text-text-muted mt-1">AI-powered retirement corpus projection & advice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locked Strategy Params */}
        <div className="glass-card space-y-4 bg-emerald-50/30 border-emerald-100">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
             <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2">
               <Target className="w-4 h-4 text-emerald-600" /> Auto-Managed Vault
             </h3>
             <span className="text-[8px] uppercase tracking-widest font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Locked</span>
          </div>
          
          <p className="text-xs font-medium text-emerald-700 leading-relaxed mb-4">
            Your Retirement Fund is fully orchestrated by the AI strategy. You do not manually add funds here.
          </p>

          <div className="bg-white/80 border border-emerald-200 rounded-2xl p-4 shadow-sm mb-4">
             <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Monthly Auto-Route</p>
             <p className="text-2xl font-black text-emerald-900">₹{Math.round(form.monthly_investment).toLocaleString()}</p>
             <p className="text-[9px] font-bold text-emerald-700 mt-1 uppercase tracking-widest">
               {plan?.retirement_pct || 15}% of investable surplus
             </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
             <div className="bg-white/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timeline</p>
                <p className="font-black text-slate-700">Age {form.current_age} → {form.retirement_age}</p>
             </div>
             <div className="bg-white/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Calculated From</p>
                <p className="font-black text-slate-700">₹{form.monthly_expenses.toLocaleString()}<span className="text-[10px] text-slate-400 font-medium">/mo burn</span></p>
             </div>
             <div className="bg-white/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Yield</p>
                <p className="font-black text-slate-700">{form.expected_return}%</p>
             </div>
             <div className="bg-white/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inflation Core</p>
                <p className="font-black text-slate-700">{form.inflation}%</p>
             </div>
          </div>
        </div>

        {/* Chart + Results */}
        <div className="lg:col-span-2 space-y-6">
          {projection ? (
            <>
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Corpus</p>
                  <p className="text-xl font-black text-indigo-950 mt-1">₹{projection.requiredCorpus.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted mt-1">Based on 4% withdrawal rule</p>
                </div>
                <div className="stat-card">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projected Corpus</p>
                  <p className={`text-xl font-black mt-1 ${projection.isOnTrack ? 'text-success' : 'text-danger'}`}>₹{projection.projectedCorpus.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted mt-1">At {form.expected_return}% return</p>
                </div>
                <div className={`stat-card border-2 ${projection.isOnTrack ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{projection.isOnTrack ? 'Surplus' : 'Shortfall'}</p>
                  <p className={`text-xl font-black mt-1 ${projection.isOnTrack ? 'text-success' : 'text-danger'}`}>₹{Math.abs(projection.gap).toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted mt-1">{projection.yearsToRetirement} years to go</p>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-card">
                <h3 className="text-sm font-black text-indigo-950 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Savings Trajectory
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projection.chartData}>
                      <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="age" tick={{fontSize: 10}} axisLine={false} tickLine={false} label={{ value: 'Age', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                      <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                      <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <ReferenceLine y={projection.requiredCorpus} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Required', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                      <Area type="monotone" dataKey="savings" stroke="#6366f1" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} name="Projected Savings" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Advice */}
              <div className={`glass-card ${projection.isOnTrack ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                <div className="flex items-start gap-3">
                  {projection.isOnTrack ? (
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm mb-1">{projection.isOnTrack ? 'On Track for Retirement!' : 'Action Required'}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {projection.isOnTrack 
                        ? `At current pace, you'll accumulate ₹${projection.projectedCorpus.toLocaleString()} by age ${form.retirement_age}. You'll have a surplus of ₹${Math.abs(projection.gap).toLocaleString()}.`
                        : `You need ₹${Math.abs(projection.gap).toLocaleString()} more. Either increase monthly investment to ₹${Math.round((parseFloat(form.monthly_investment) || 0) * 1.3).toLocaleString()} (+30%), or extend retirement age to ${form.retirement_age + 3}.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card text-center py-20">
              <Clock className="w-16 h-16 mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">Enter your details</h3>
              <p className="text-sm text-text-muted mt-2">Fill in your retirement parameters to see projections.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
