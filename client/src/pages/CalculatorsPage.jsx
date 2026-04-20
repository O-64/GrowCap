import { useState } from 'react';
import { calcSIP, calcMutualFund, calcFD, calcEMI } from '../services/api';
import { Calculator, TrendingUp, Landmark, CreditCard, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tabs = [
  { id: 'sip', label: 'SIP', icon: TrendingUp },
  { id: 'mf', label: 'Mutual Fund', icon: Calculator },
  { id: 'fd', label: 'Fixed Deposit', icon: Landmark },
  { id: 'emi', label: 'EMI', icon: CreditCard },
];

export default function CalculatorsPage() {
  const [active, setActive] = useState('sip');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // SIP
  const [sipForm, setSipForm] = useState({ monthly_investment: 5000, annual_rate: 12, duration_years: 10 });
  // MF
  const [mfForm, setMfForm] = useState({ principal: 100000, annual_rate: 12, duration_years: 10 });
  // FD
  const [fdForm, setFdForm] = useState({ principal: 100000, annual_rate: 7.5, tenure_months: 12, compounding: 'quarterly' });
  // EMI
  const [emiForm, setEmiForm] = useState({ principal: 1000000, annual_rate: 8.5, tenure_months: 60 });

  async function calculate() {
    setLoading(true);
    try {
      let res;
      if (active === 'sip') res = await calcSIP(sipForm);
      else if (active === 'mf') res = await calcMutualFund(mfForm);
      else if (active === 'fd') res = await calcFD(fdForm);
      else res = await calcEMI(emiForm);
      setResult(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Financial Calculators</h1>
        <p className="text-text-muted mt-1">Plan your investments with precision</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActive(t.id); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${active === t.id ? 'bg-primary text-white' : 'bg-surface-light/60 text-text-muted hover:text-text'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">{tabs.find(t => t.id === active)?.label} Calculator</h3>

          {active === 'sip' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Monthly Investment (₹)</label>
                <input type="number" value={sipForm.monthly_investment} onChange={e => setSipForm({...sipForm, monthly_investment: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Expected Annual Return (%)</label>
                <input type="number" value={sipForm.annual_rate} onChange={e => setSipForm({...sipForm, annual_rate: +e.target.value})} className="input-field" step="0.1" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Duration (Years)</label>
                <input type="number" value={sipForm.duration_years} onChange={e => setSipForm({...sipForm, duration_years: +e.target.value})} className="input-field" />
              </div>
            </div>
          )}

          {active === 'mf' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Lumpsum Amount (₹)</label>
                <input type="number" value={mfForm.principal} onChange={e => setMfForm({...mfForm, principal: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Expected Annual Return (%)</label>
                <input type="number" value={mfForm.annual_rate} onChange={e => setMfForm({...mfForm, annual_rate: +e.target.value})} className="input-field" step="0.1" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Duration (Years)</label>
                <input type="number" value={mfForm.duration_years} onChange={e => setMfForm({...mfForm, duration_years: +e.target.value})} className="input-field" />
              </div>
            </div>
          )}

          {active === 'fd' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Principal Amount (₹)</label>
                <input type="number" value={fdForm.principal} onChange={e => setFdForm({...fdForm, principal: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Interest Rate (%)</label>
                <input type="number" value={fdForm.annual_rate} onChange={e => setFdForm({...fdForm, annual_rate: +e.target.value})} className="input-field" step="0.1" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Tenure (Months)</label>
                <input type="number" value={fdForm.tenure_months} onChange={e => setFdForm({...fdForm, tenure_months: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Compounding</label>
                <select value={fdForm.compounding} onChange={e => setFdForm({...fdForm, compounding: e.target.value})} className="input-field">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half-yearly">Half-Yearly</option>
                </select>
              </div>
            </div>
          )}

          {active === 'emi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Loan Amount (₹)</label>
                <input type="number" value={emiForm.principal} onChange={e => setEmiForm({...emiForm, principal: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Interest Rate (%)</label>
                <input type="number" value={emiForm.annual_rate} onChange={e => setEmiForm({...emiForm, annual_rate: +e.target.value})} className="input-field" step="0.1" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Tenure (Months)</label>
                <input type="number" value={emiForm.tenure_months} onChange={e => setEmiForm({...emiForm, tenure_months: +e.target.value})} className="input-field" />
              </div>
            </div>
          )}

          <button onClick={calculate} disabled={loading} className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2">
            <IndianRupee className="w-4 h-4" /> {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>

        {/* Results */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          {result ? (
            <div className="space-y-4">
              {active === 'sip' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Total Invested</p><p className="text-xl font-bold text-primary-light mt-1">₹{result.total_invested?.toLocaleString()}</p></div>
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Wealth Gained</p><p className="text-xl font-bold text-success mt-1">₹{result.wealth_gained?.toLocaleString()}</p></div>
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Maturity Amount</p><p className="text-xl font-bold text-accent mt-1">₹{result.maturity_amount?.toLocaleString()}</p></div>
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Maturity Date</p><p className="text-xl font-bold mt-1">{result.maturity_date}</p></div>
                  </div>
                </>
              )}
              {active === 'mf' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Principal</p><p className="text-xl font-bold text-primary-light mt-1">₹{result.principal?.toLocaleString()}</p></div>
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Returns</p><p className="text-xl font-bold text-success mt-1">₹{result.total_returns?.toLocaleString()}</p></div>
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Maturity Amount</p><p className="text-xl font-bold text-accent mt-1">₹{result.maturity_amount?.toLocaleString()}</p></div>
                    <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Maturity Date</p><p className="text-xl font-bold mt-1">{result.maturity_date}</p></div>
                  </div>
                  {result.projection && (
                    <div className="h-48 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.projection}>
                          <defs><linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} formatter={v => [`₹${v.toLocaleString()}`, 'Value']} />
                          <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#projGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
              {active === 'fd' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Principal</p><p className="text-xl font-bold text-primary-light mt-1">₹{result.principal?.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Interest Earned</p><p className="text-xl font-bold text-success mt-1">₹{result.interest_earned?.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Maturity Amount</p><p className="text-xl font-bold text-accent mt-1">₹{result.maturity_amount?.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Maturity Date</p><p className="text-xl font-bold mt-1">{result.maturity_date}</p></div>
                </div>
              )}
              {active === 'emi' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface/60 col-span-2"><p className="text-xs text-text-muted">Monthly EMI</p><p className="text-3xl font-bold text-accent mt-1">₹{result.monthly_emi?.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Total Payment</p><p className="text-xl font-bold mt-1">₹{result.total_payment?.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-surface/60"><p className="text-xs text-text-muted">Total Interest</p><p className="text-xl font-bold text-danger mt-1">₹{result.total_interest?.toLocaleString()}</p></div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Enter values and click Calculate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
