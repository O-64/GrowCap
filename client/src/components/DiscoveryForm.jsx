import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitDiscovery } from '../services/api';
import { User, Briefcase, IndianRupee, PieChart, Sparkles, Loader2, Calendar, Target, ShieldCheck } from 'lucide-react';

export default function DiscoveryForm({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Individual
    birth_date: '',
    income: '',
    rent_emi: '',
    essential_expenses: '',
    non_essential_expenses: '',
    other_needs: '',
    // Business
    revenue: '',
    payroll: '',
    opex: '',
    tax_liability: '',
  });

  const isBusiness = user?.user_type === 'business';

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitDiscovery(formData);
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card shadow-2xl border-primary/20 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-indigo-950">Financial Discovery</h2>
          <p className="text-text-muted text-sm">Help {user?.user_type === 'business' ? 'your Manager' : 'your Advisor'} understand your profile</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-surface-lighter'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg text-indigo-900 pb-2 border-b border-indigo-50 flex items-center gap-2">
              <User className="w-5 h-5" /> Basic Information
            </h3>
            {!isBusiness && (
                <div>
                    <label className="label-text">Date of Birth (For Age-Based Rules)</label>
                    <input type="date" className="input-field" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} required={!isBusiness} />
                </div>
            )}
            <div>
              <label className="label-text">{isBusiness ? 'Average Monthly Revenue' : 'Regular Monthly Income'}</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                    type="number" 
                    className="input-field pl-10" 
                    placeholder={isBusiness ? 'e.g. 5000000' : 'e.g. 75000'}
                    value={isBusiness ? formData.revenue : formData.income}
                    onChange={e => setFormData({...formData, [isBusiness ? 'revenue' : 'income']: e.target.value})}
                    required 
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={handleNext} className="btn-primary w-full md:w-32">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg text-indigo-900 pb-2 border-b border-indigo-50 flex items-center gap-2">
              <PieChart className="w-5 h-5" /> Major Obligations 
            </h3>
            {isBusiness ? (
               <>
                 <div>
                    <label className="label-text">Total Monthly Payroll</label>
                    <input type="number" className="input-field" value={formData.payroll} onChange={e => setFormData({...formData, payroll: e.target.value})} required />
                 </div>
                 <div>
                    <label className="label-text">Operational Expenses (OpEx)</label>
                    <input type="number" className="input-field" value={formData.opex} onChange={e => setFormData({...formData, opex: e.target.value})} required />
                 </div>
               </>
            ) : (
                <>
                <div>
                   <label className="label-text">Rent / Home Loan EMI</label>
                   <input type="number" className="input-field" value={formData.rent_emi} onChange={e => setFormData({...formData, rent_emi: e.target.value})} required />
                </div>
                <div>
                   <label className="label-text">Essential Monthly Expenses (Grocery, Bills)</label>
                   <input type="number" className="input-field" value={formData.essential_expenses} onChange={e => setFormData({...formData, essential_expenses: e.target.value})} required />
                </div>
              </>
            )}
            <div className="flex justify-between pt-4">
              <button type="button" onClick={handleBack} className="btn-secondary">Back</button>
              <button type="button" onClick={handleNext} className="btn-primary w-32">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg text-indigo-900 pb-2 border-b border-indigo-50 flex items-center gap-2">
              <Target className="w-5 h-5" /> Future Planning
            </h3>
            {isBusiness ? (
                <div>
                    <label className="label-text">Estimated Annual Tax Liability</label>
                    <input type="number" className="input-field" value={formData.tax_liability} onChange={e => setFormData({...formData, tax_liability: e.target.value})} required />
                </div>
            ) : (
                <>
                    <div>
                        <label className="label-text">Non-Essential Expenses (Gym, Fun, Hobby)</label>
                        <input type="number" className="input-field" value={formData.non_essential_expenses} onChange={e => setFormData({...formData, non_essential_expenses: e.target.value})} />
                    </div>
                    <div>
                        <label className="label-text">Other Monthly Needs (Education, Travel Sinking Fund)</label>
                        <input type="number" className="input-field" value={formData.other_needs} onChange={e => setFormData({...formData, other_needs: e.target.value})} />
                    </div>
                </>
            )}

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 font-medium tracking-tight">After completing discovery, you'll see your Total Savings and choose an investment strategy. You can add investments later from the Portfolio page.</p>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={handleBack} className="btn-secondary">Back</button>
              <button type="submit" className="btn-primary w-full md:w-48 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Discovery'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
