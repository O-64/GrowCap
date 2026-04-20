import { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal, validateGoal, getDiscoveryData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, Plus, Trash2, X, CheckCircle2, PauseCircle, Sparkles, Loader2, Calendar, TrendingUp, Wallet } from 'lucide-react';

const CATEGORIES = ['retirement', 'house', 'education', 'emergency', 'vacation', 'other'];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [discovery, setDiscovery] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', monthly_contribution: '', target_date: '', category: 'other', priority: 'medium' });
  
  // Validation state
  const [validatingId, setValidatingId] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { 
      const { data } = await getGoals(); 
      setGoals(data);
      const { data: dData } = await getDiscoveryData().catch(() => ({ data: null }));
      setDiscovery(dData);
    } catch (err) { console.error(err); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await createGoal({ ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount) || 0, monthly_contribution: parseFloat(form.monthly_contribution) || 0 });
      setShowAdd(false);
      setForm({ name: '', target_amount: '', current_amount: '', monthly_contribution: '', target_date: '', category: 'other', priority: 'medium' });
      loadGoals();
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this goal?')) return;
    try { await deleteGoal(id); loadGoals(); } catch (err) { console.error(err); }
  }

  async function handleValidate(id) {
    setValidatingId(id);
    try {
      const { data } = await validateGoal(id);
      setValidationResult(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Validation failed');
    } finally {
      setValidatingId(null);
    }
  }

  const priorityColors = { high: 'text-danger', medium: 'text-warning', low: 'text-success' };
  const categoryEmoji = { retirement: '🏖️', house: '🏠', education: '🎓', emergency: '🚨', vacation: '✈️', other: '🎯' };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-text-muted mt-1">Set targets and track your progress</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>
      
      {discovery && (
        <div className="glass-card bg-indigo-50/20 border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">Goal Sustainability Audit</h3>
              <p className="text-xs text-slate-500 font-medium tracking-tight">AI cross-reference with Discovery Surplus</p>
            </div>
          </div>
          
          <div className="flex gap-8 items-center">
            <div className="text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Surplus</p>
               <p className="text-xl font-black text-emerald-600">₹{(Math.max(0, (user.monthly_income || 0) - ((discovery.essential_expenses || 0) + (discovery.non_essential_expenses || 0) + (discovery.rent_emi || 0) + (discovery.opex || 0)))).toLocaleString()}</p>
            </div>
            <div className="w-px h-10 bg-indigo-100 hidden md:block"></div>
            <div className="text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Committed to Goals</p>
               <p className="text-xl font-black text-indigo-900">₹{goals.reduce((acc, g) => acc + (parseFloat(g.monthly_contribution) || 0), 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="px-4 py-2 bg-white rounded-xl border border-indigo-100 text-[10px] font-bold text-indigo-600 shadow-sm uppercase tracking-widest">
            {goals.reduce((acc, g) => acc + (parseFloat(g.monthly_contribution) || 0), 0) > (user.monthly_income - (discovery.essential_expenses + discovery.non_essential_expenses + (discovery.rent_emi || 0))) 
              ? '🚨 Over-Committed' 
              : '✅ Sustainable'}
          </div>
        </div>
      )}

      {/* Goals grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => {
            const progress = parseFloat(g.progress) || 0;
            return (
              <div key={g.id} className="glass-card relative group flex flex-col justify-between h-full">
                <button onClick={() => handleDelete(g.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{categoryEmoji[g.category] || '🎯'}</span>
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-text-muted capitalize">{g.category} • <span className={priorityColors[g.priority]}>{g.priority} priority</span></p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-muted">₹{parseFloat(g.current_amount).toLocaleString()}</span>
                      <span className="font-medium">₹{parseFloat(g.target_amount).toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface-lighter overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-text-muted">{progress}% complete</p>
                      {g.status === 'completed' ? (
                        <span className="badge badge-success flex items-center gap-1 py-0 px-2 text-[10px]"><CheckCircle2 className="w-2 h-2" />Done</span>
                      ) : (
                        <span className="badge badge-success py-0 px-2 text-[10px]">Active</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <TrendingUp className="w-3 h-3"/> Contribution: ₹{parseFloat(g.monthly_contribution).toLocaleString()}/mo
                    </div>
                    {g.target_date && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Calendar className="w-3 h-3"/> Target: {new Date(g.target_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleValidate(g.id)}
                  className="w-full mt-2 py-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition shadow-sm"
                  disabled={validatingId === g.id}
                >
                  {validatingId === g.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                  AI Validate Timeline
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card text-center py-16">
          <Target className="w-16 h-16 mx-auto text-primary/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No financial goals yet</h3>
          <p className="text-text-muted mb-4">Set your first goal to start planning your financial future</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Create Goal</button>
        </div>
      )}

      {/* Validation Result Modal */}
      {validationResult && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setValidationResult(null)}>
          <div className="bg-white max-w-sm w-full rounded-3xl p-8 shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setValidationResult(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition"><X className="w-5 h-5"/></button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${validationResult.isOnTrack ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <Sparkles className="w-8 h-8"/>
            </div>
            
            <h3 className="text-xl font-black text-center text-slate-900 mb-2">GrowCap AI Audit</h3>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${validationResult.isOnTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 tooltip'}`}>
                {validationResult.isOnTrack ? 'On Track' : 'Needs Action'}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Plan Allocation</span>
                <span className="font-bold text-slate-800">₹{validationResult.totalMonthlyRaw.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Timeline Estimate</span>
                <span className="font-bold text-slate-800">{validationResult.monthsNeeded} Months</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-sm text-slate-600 italic leading-relaxed">"{validationResult.suggestion}"</p>
            </div>

            <button onClick={() => setValidationResult(null)} className="w-full mt-8 py-4 bg-indigo-900 text-white rounded-xl font-bold shadow-xl shadow-indigo-200">Got it!</button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass-card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">New Financial Goal</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-surface-lighter"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Goal Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. Buy a house" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Target Amount (₹) *</label>
                  <input type="number" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Current Savings (₹)</label>
                  <input type="number" value={form.current_amount} onChange={e => setForm({...form, current_amount: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Monthly Contribution (₹)</label>
                  <input type="number" value={form.monthly_contribution} onChange={e => setForm({...form, monthly_contribution: e.target.value})} className="input-field" required />
                  
                  {/* Realtime calculation */}
                  {parseFloat(form.target_amount) > 0 && parseFloat(form.monthly_contribution) > 0 && (
                     <p className="text-[10px] font-bold text-primary mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3"/> 
                        Estimated Time: {Math.ceil((parseFloat(form.target_amount) - (parseFloat(form.current_amount)||0)) / parseFloat(form.monthly_contribution))} months
                     </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Deadline / Target Date</label>
                  <input type="date" value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3">Create Goal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
