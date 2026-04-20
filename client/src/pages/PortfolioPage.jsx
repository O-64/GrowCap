import { useState, useEffect } from 'react';
import { getPortfolios, getPortfolioSummary, createPortfolio, addHolding, deleteHolding, fetchOnboardingPlan, getDiscoveryData, getRiskAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, PieChart, TrendingUp, Building2, Landmark, X, Activity, Target as TargetIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const TYPE_ICONS = { stock: TrendingUp, mutual_fund: PieChart, sip: Building2, fd: Landmark, gov_bond: Landmark };
const TYPE_COLORS = { stock: 'text-primary-light', mutual_fund: 'text-accent', sip: 'text-success', fd: 'text-warning', gov_bond: 'text-emerald-500' };

export default function PortfolioPage() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [summary, setSummary] = useState(null);
  const [plan, setPlan] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [filteringCategory, setFilteringCategory] = useState(null); // 'equity', 'safe', or null
  const [form, setForm] = useState({ type: 'stock', symbol: '', name: '', quantity: '', buy_price: '', invested_amount: '', interest_rate: '', maturity_date: '', sip_day: '', notes: '' });

  // AI Analyse State
  const [aiModal, setAiModal] = useState({ show: false, item: null, targetValue: 0 });
  const [aiForm, setAiForm] = useState({ type: 'stock', mode: 'sip' });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadPortfolios(); }, []);

  async function loadPortfolios() {
    try {
      let { data } = await getPortfolios();
      
      // If no portfolio exists (e.g. after DB reset), create a default one
      if (data.length === 0) {
        await createPortfolio({ name: 'Main Portfolio', description: 'Primary investment bucket' });
        const res = await getPortfolios();
        data = res.data;
      }

      setPortfolios(data);
      
      const { data: pData } = await fetchOnboardingPlan().catch(() => ({ data: null }));
      setPlan(pData);

      const { data: dData } = await getDiscoveryData().catch(() => ({ data: null }));
      setDiscovery(dData);

      if (data.length > 0) {
        setActivePortfolio(data[0].id);
        const { data: sum } = await getPortfolioSummary(data[0].id);
        setSummary(sum);
        const { data: risk } = await getRiskAnalysis(data[0].id).catch(() => ({ data: null }));
        setRiskData(risk);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    
    // Calculate Monthly Surplus (Savings)
    const totalIncome = Number(user?.monthly_income) || 0;
    const fixedExpenses = Number(discovery?.essential_expenses || 0) + Number(discovery?.non_essential_expenses || 0) + Number(discovery?.rent_emi || 0) + Number(discovery?.opex || 0) + Number(discovery?.other_needs || 0);
    const totalSavingsLeft = Math.max(0, totalIncome - fixedExpenses);
    
    // Calculate intended investment amount
    const intendedAmount = form.type === 'stock' || form.type === 'mutual_fund' 
       ? (parseFloat(form.quantity) || 0) * (parseFloat(form.buy_price) || 0) 
       : parseFloat(form.invested_amount) || 0;

    if (intendedAmount > totalSavingsLeft) {
       alert(`Investment Blocked: You cannot invest ₹${intendedAmount.toLocaleString()} because your Total Savings Left is only ₹${totalSavingsLeft.toLocaleString()}. Please adjust your lifestyle budget or update your income.`);
       return;
    }
    
    // Strict Strategy Verification
    if (['stock', 'mutual_fund', 'sip'].includes(form.type)) {
       const equityTarget = totalSavingsLeft * (plan?.equity_pct || 40) / 100;
       const currentEquity = (summary?.summary?.allocationValues?.stock || 0) + (summary?.summary?.allocationValues?.mutual_fund || 0) + (summary?.summary?.allocationValues?.sip || 0);
       if (currentEquity + intendedAmount > equityTarget) {
          alert(`Strategy Verification Failed: This investment pushes your Equity total to ₹${Math.round(currentEquity + intendedAmount).toLocaleString()}, which exceeds your strict AI Strategy limit of ₹${Math.round(equityTarget).toLocaleString()}.`);
          return;
       }
    }

    if (['fd', 'gov_bond'].includes(form.type)) {
       const safeTarget = totalSavingsLeft * (plan?.safe_pct || 20) / 100;
       const currentSafe = (summary?.summary?.allocationValues?.fd || 0) + (summary?.summary?.allocationValues?.gov_bond || 0);
       if (currentSafe + intendedAmount > safeTarget) {
          alert(`Strategy Verification Failed: This investment pushes your Safe Assets total to ₹${Math.round(currentSafe + intendedAmount).toLocaleString()}, which exceeds your strict AI Strategy limit of ₹${Math.round(safeTarget).toLocaleString()}.`);
          return;
       }
    }

    try {
      await addHolding(activePortfolio, {
        ...form,
        quantity: parseFloat(form.quantity) || 0,
        buy_price: parseFloat(form.buy_price) || 0,
        invested_amount: intendedAmount,
        interest_rate: parseFloat(form.interest_rate) || 0,
      });
      setShowAdd(false);
      setSuccessMessage(`${form.name} added successfully! Analyzed risk updated.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setForm({ type: 'stock', symbol: '', name: '', quantity: '', buy_price: '', invested_amount: '', interest_rate: '', maturity_date: '', sip_day: '', notes: '' });
      
      const { data: sum } = await getPortfolioSummary(activePortfolio);
      setSummary(sum);
      const { data: risk } = await getRiskAnalysis(activePortfolio).catch(() => ({ data: null }));
      setRiskData(risk);
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this holding?')) return;
    try {
      await deleteHolding(id);
      const { data } = await getPortfolioSummary(activePortfolio);
      setSummary(data);
    } catch (err) { console.error(err); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  function getShareLink() {
    if (!summary) return '#';
    const text = `📊 *My GrowCap Portfolio*\nTotal Invested: ₹${summary.summary.totalInvested.toLocaleString()}\nCurrent Value: ₹${summary.summary.totalCurrent.toLocaleString()}\nTotal P&L: ₹${summary.summary.totalPnL.toLocaleString()} (${summary.summary.pnlPercent}%)\n\n_Tracked via GrowCap AI Platform_`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Management</h1>
          <p className="text-text-muted mt-1">Track and manage your investments</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={getShareLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Share to WhatsApp
          </a>
          <button onClick={() => { setFilteringCategory(null); setForm({ type: 'stock', symbol: '', name: '', quantity: '', buy_price: '', invested_amount: '', interest_rate: '', maturity_date: '', sip_day: '', notes: '' }); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Investment
          </button>
        </div>

        {/* AI Analyse Modal Inline / Overlay */}
        {aiModal.show && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAiModal({ show: false, item: null, targetValue: 0 })}>
            <div className="glass-card w-full max-w-lg overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600"/> AI Asset Allocation</h3>
                <button onClick={() => setAiModal({ show: false, item: null, targetValue: 0 })} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              {!aiResult ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 font-medium">Configure parameters for a ₹{Math.round(aiModal.targetValue).toLocaleString()} strategy fulfillment.</p>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Asset Type</label>
                    <div className="flex gap-2">
                      {['stock', 'mutual_fund', 'etf'].map(t => (
                         <button key={t} onClick={() => setAiForm(p => ({ ...p, type: t }))} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${aiForm.type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                           {t.replace('_', ' ').toUpperCase()}
                         </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Investment Mode</label>
                    <div className="flex gap-2">
                      {['sip', 'lumpsum'].map(m => (
                         <button key={m} onClick={() => setAiForm(p => ({ ...p, mode: m }))} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${aiForm.mode === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                           {m.toUpperCase()}
                         </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    disabled={aiLoading}
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        const { analyseAllocation } = await import('../services/api');
                        const res = await analyseAllocation({ category: aiModal.item.type, assetType: aiForm.type, mode: aiForm.mode, targetValue: aiModal.targetValue });
                        setAiResult(res.data[0]);
                      } catch (err) {
                        alert('Failed to run AI analysis');
                      } finally {
                        setAiLoading(false);
                      }
                    }} 
                    className="w-full btn-primary flex justify-center items-center gap-2 mt-4"
                  >
                    {aiLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Strategy
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                     <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mb-1">AI Recommendation</p>
                     <h4 className="text-xl font-bold text-indigo-950">{aiResult.name}</h4>
                     
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-3 border border-indigo-50">
                           <p className="text-[10px] font-bold text-slate-400">Target Price</p>
                           <p className="text-sm font-black text-slate-800">₹{aiResult.price}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-50">
                           <p className="text-[10px] font-bold text-slate-400">Quantity</p>
                           <p className="text-sm font-black text-slate-800">{aiResult.quantity}</p>
                        </div>
                     </div>
                     
                     <div className="mt-4 bg-indigo-600 text-white rounded-lg p-3 flex justify-between items-center">
                        <span className="text-xs font-bold opacity-80">Total Value Fulfilled</span>
                        <span className="font-black">₹{Math.round(aiResult.total_value).toLocaleString()}</span>
                     </div>

                     <p className="text-xs text-indigo-800 mt-4 leading-relaxed bg-indigo-100/50 p-3 rounded-lg">
                       <b>Reasoning:</b> {aiResult.reason}
                     </p>
                   </div>
                   
                   <button onClick={() => {
                       setFilteringCategory(aiModal.item.type);
                       setForm(prev => ({ ...prev, invested_amount: Math.round(aiResult.total_value), type: aiForm.type === 'stock' ? 'stock' : 'mutual_fund', name: aiResult.name, buy_price: aiResult.price, quantity: aiResult.quantity })); 
                       setAiModal({ show: false, item: null, targetValue: 0 });
                       setAiResult(null);
                       setShowAdd(true);
                   }} className="w-full btn-primary">
                     Accept & Add to Portfolio
                   </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && summary.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-text-muted">Total Invested</p>
            <p className="text-xl font-bold mt-1">₹{summary.summary.totalInvested.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-text-muted">Current Value</p>
            <p className="text-xl font-bold mt-1">₹{summary.summary.totalCurrent.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-text-muted">Total P&L</p>
            <p className={`text-xl font-bold mt-1 ${summary.summary.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
              {summary.summary.totalPnL >= 0 ? '+' : ''}₹{summary.summary.totalPnL.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-text-muted">Returns</p>
            <p className={`text-xl font-bold mt-1 ${summary.summary.pnlPercent >= 0 ? 'text-success' : 'text-danger'}`}>
              {summary.summary.pnlPercent >= 0 ? '+' : ''}{summary.summary.pnlPercent}%
            </p>
          </div>
        </div>
      )}

      {/* Strategic Allocation Audit */}
      {discovery && summary?.summary?.allocationValues && (
        <div className="glass-card border-indigo-100 bg-indigo-50/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-full border border-indigo-100">
                <Sparkles className="w-3 h-3"/> AI Discovery Linked
             </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-950">Strategic Allocation Audit</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {(() => {
                const totalMonthly = Number(user?.monthly_income) || 0;
                const fixedExpenses = Number(discovery?.essential_expenses || 0) + Number(discovery?.non_essential_expenses || 0) + Number(discovery?.rent_emi || 0) + Number(discovery?.opex || 0) + Number(discovery?.other_needs || 0);
                const surplus = Math.max(0, totalMonthly - fixedExpenses);
                
                return [
                  { label: 'Equity (Stocks/MFs/SIPs)', key: 'equity_pct', type: 'equity', actual: (summary.summary.allocationValues.stock || 0) + (summary.summary.allocationValues.mutual_fund || 0) + (summary.summary.allocationValues.sip || 0), targetPct: plan?.equity_pct || 40 },
                  { label: 'Safe (FDs/Bonds)', key: 'safe_pct', type: 'safe', actual: (summary.summary.allocationValues.fd || 0) + (summary.summary.allocationValues.gov_bond || 0), targetPct: plan?.safe_pct || 20 },
                  { label: 'Emergency Fund', key: 'emergency_pct', type: 'emergency', actual: surplus * ((plan?.emergency_pct || 10) / 100), targetPct: plan?.emergency_pct || 10, autoManaged: true },
                  { label: 'Retirement', key: 'retirement_pct', type: 'retirement', actual: surplus * ((plan?.retirement_pct || 30) / 100), targetPct: plan?.retirement_pct || 30, autoManaged: true }
                ].map(item => {
                  const target = surplus * (item.targetPct / 100);
                  const diff = item.actual - target;
                  const pctFilled = target > 0 ? Math.min(100, (item.actual / target) * 100) : 0;
                  
                  const isPending = (item.type === 'equity' || item.type === 'safe') && item.actual === 0;

                  return (
                    <div key={item.key} className="relative group">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-wider">
                        <span className="text-slate-500">{item.label}</span>
                        {isPending ? (
                           <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse text-[8px]">Action Required</span>
                        ) : item.autoManaged ? (
                           <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[8px] flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5"/> Auto-Synced</span>
                        ) : (
                           <span className={diff >= 0 ? 'text-success' : 'text-amber-600'}>
                             ₹{item.actual.toLocaleString()} / ₹{Math.round(target).toLocaleString()}
                           </span>
                        )}
                      </div>
                      
                      {isPending ? (
                         <div className="flex gap-2">
                            <button onClick={() => { 
                              setFilteringCategory(item.type);
                              setForm(prev => ({ ...prev, invested_amount: Math.round(target), type: item.type === 'equity' ? 'mutual_fund' : 'fd' })); 
                              setShowAdd(true); 
                              window.scrollTo(0,0); 
                            }} className="flex-1 text-left bg-rose-50 border border-rose-200 rounded-lg p-3 hover:bg-rose-100 transition-all cursor-pointer">
                               <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-rose-500" />
                                  <div>
                                    <p className="text-xs font-black text-rose-700 uppercase tracking-tight">Pending Assignment</p>
                                    <p className="text-[10px] text-rose-600 font-medium">Add ₹{Math.round(target).toLocaleString()} manually</p>
                                  </div>
                               </div>
                            </button>
                            
                            {item.type === 'equity' && (
                               <button onClick={() => {
                                  setAiResult(null);
                                  setAiModal({ show: true, item, targetValue: target });
                               }} className="border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg p-3 flex flex-col items-center justify-center transition-colors">
                                  <Sparkles className="w-5 h-5 mb-1 text-indigo-600" />
                                  <span className="text-[9px] font-black uppercase whitespace-nowrap">AI Analyse</span>
                               </button>
                            )}
                         </div>
                      ) : (
                         <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden border border-slate-100 relative">
                           {item.autoManaged && <div className="absolute inset-0 bg-emerald-400/20 z-10" />}
                           <div 
                             className={`h-full transition-all duration-1000 ${item.autoManaged ? 'bg-emerald-500' : diff >= 0 ? 'bg-indigo-600' : 'bg-amber-400'}`} 
                             style={{ width: `${pctFilled}%` }} 
                           />
                         </div>
                      )}
                      
                      {item.autoManaged && (
                         <div className="mt-1 flex justify-between text-[9px] font-bold text-slate-400">
                           <span>Target Met via Strategy</span>
                           <span className="text-emerald-600 font-black">₹{Math.round(item.actual).toLocaleString()}</span>
                         </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="bg-white/80 rounded-3xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <TargetIcon className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-indigo-950">Monthly Surplus Audit</h4>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium font-bold">Total Monthly Income</span>
                   <span className="font-black text-indigo-950 font-bold">₹{Number(user?.monthly_income || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium font-bold">Discovery Expenses</span>
                   <span className="font-black text-rose-600 font-bold">- ₹{(Number(discovery?.essential_expenses || 0) + Number(discovery?.non_essential_expenses || 0) + Number(discovery?.rent_emi || 0) + Number(discovery?.opex || 0)).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-indigo-100 flex justify-between items-center text-md font-black">
                   <span className="text-indigo-900 font-bold">Investible Surplus</span>
                   <span className="text-emerald-600 font-bold">₹{(Math.max(0, Number(user?.monthly_income || 0) - (Number(discovery?.essential_expenses || 0) + Number(discovery?.non_essential_expenses || 0) + Number(discovery?.rent_emi || 0) + Number(discovery?.opex || 0)))).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                Based on your {user.user_type} profile, you have a monthly surplus of <strong>₹{(Math.max(0, Number(user?.monthly_income || 0) - (Number(discovery?.essential_expenses || 0) + Number(discovery?.non_essential_expenses || 0) + Number(discovery?.rent_emi || 0) + Number(discovery?.opex || 0)))).toLocaleString()}</strong>.
                Click on any "Action Required" items to fulfill your active strategy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">Holdings ({summary?.holdings?.length || 0})</h3>
        {summary?.holdings?.length > 0 ? (
          <div className="space-y-3">
            {summary.holdings.map(h => {
              const Icon = TYPE_ICONS[h.type] || TrendingUp;
              const pnl = parseFloat(h.current_value || h.invested_amount) - parseFloat(h.invested_amount);
              const pnlPct = parseFloat(h.invested_amount) > 0 ? ((pnl / parseFloat(h.invested_amount)) * 100).toFixed(1) : 0;
              return (
                <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface/60 border border-border/50 hover:border-primary/30 transition">
                  <div className={`w-10 h-10 rounded-xl bg-surface-lighter flex items-center justify-center ${TYPE_COLORS[h.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{h.name}</p>
                    <p className="text-xs text-text-muted">{h.type.replace('_', ' ').toUpperCase()} {h.symbol && `• ${h.symbol}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{parseFloat(h.current_value || h.invested_amount).toLocaleString()}</p>
                    <p className={`text-xs ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>{pnl >= 0 ? '+' : ''}{pnlPct}%</p>
                  </div>
                  <button onClick={() => handleDelete(h.id)} className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No holdings yet. Click "Add Investment" to get started.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Investment</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-surface-lighter"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {['stock', 'mutual_fund', 'sip', 'fd', 'gov_bond']
                .filter(t => {
                   if (!filteringCategory) return true;
                   if (filteringCategory === 'equity') return ['stock', 'mutual_fund', 'sip'].includes(t);
                   if (filteringCategory === 'safe') return ['fd', 'gov_bond'].includes(t);
                   return true;
                })
                .map(t => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setForm({ type: t, symbol: '', name: '', quantity: '', buy_price: '', invested_amount: '', interest_rate: '', maturity_date: '', sip_day: '', notes: '' })}
                  className={`flex-1 min-w-[80px] py-3 text-[10px] font-black rounded-xl border uppercase tracking-wider transition ${form.type === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              
              {form.type === 'stock' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Stock Name *</label>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. Reliance Industries" required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ticker Symbol</label>
                      <input value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} className="input-field" placeholder="RELIANCE.NS" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quantity</label>
                      <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field" placeholder="10" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Buy Price (₹)</label>
                      <input type="number" value={form.buy_price} onChange={e => setForm({...form, buy_price: e.target.value})} className="input-field" placeholder="2500" step="0.01" required />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'mutual_fund' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fund Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. Parag Parikh Flexi Cap" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Units Allocated</label>
                      <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field" placeholder="100.5" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Average NAV/Buy Price (₹)</label>
                      <input type="number" value={form.buy_price} onChange={e => setForm({...form, buy_price: e.target.value})} className="input-field" placeholder="50.25" step="0.01" required />
                    </div>
                  </div>
                </div>
              )}

              {form.type === 'sip' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">SIP Plan Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. SBI Small Cap SIP" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly Amount (₹) *</label>
                      <input type="number" value={form.invested_amount} onChange={e => setForm({...form, invested_amount: e.target.value})} className="input-field" placeholder="5000" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Auto-Deduct Day</label>
                      <input type="number" value={form.sip_day} onChange={e => setForm({...form, sip_day: e.target.value})} className="input-field" placeholder="e.g. 5" min="1" max="28" />
                    </div>
                  </div>
                </div>
              )}

              {(form.type === 'fd' || form.type === 'gov_bond') && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bank / FD Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. HDFC Bank 5-Yr FD" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Principal Amount (₹) *</label>
                    <input 
                       type="number" 
                       value={form.invested_amount} 
                       onChange={e => setForm({...form, invested_amount: e.target.value})} 
                       className={`input-field ${filteringCategory === 'safe' ? 'bg-slate-100 cursor-not-allowed font-black text-indigo-900 border-indigo-200' : ''}`} 
                       placeholder="100000" 
                       step="0.01" 
                       required 
                       readOnly={filteringCategory === 'safe'}
                    />
                    {filteringCategory === 'safe' && <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase tracking-tight">✨ Value Fixed by AI Strategy Target</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Interest Rate (%)</label>
                      <input type="number" value={form.interest_rate} onChange={e => setForm({...form, interest_rate: e.target.value})} className="input-field" placeholder="7.5" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Maturity Date</label>
                      <input type="date" value={form.maturity_date} onChange={e => setForm({...form, maturity_date: e.target.value})} className="input-field" />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-text-muted mb-1">Notes</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" placeholder="Optional notes" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Add to Portfolio</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
