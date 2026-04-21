import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitDiscovery } from '../services/api';
import { User, Briefcase, IndianRupee, PieChart, Sparkles, Loader2, Calendar, Target, ShieldCheck, ArrowRight, ArrowLeft, Info, HelpCircle, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    // Initial Assets (Last Page details)
    initial_stocks: '',
    initial_mf: '',
    initial_sip: '',
    initial_fd: '',
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

  const steps = [
    { title: "Basics", desc: "Setting the foundation" },
    { title: "Obligations", desc: "Understanding the load" },
    { title: "Commitments", desc: "Mapping the future" },
    { title: "Assets", desc: "Initial Portfolio" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10 items-stretch">
      {/* Sidebar - Educational Context */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-black">AI Discovery</h2>
            </div>

            <nav className="space-y-6 relative z-10">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4 items-start">
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-all ${step === i+1 ? 'bg-rose-500 border-rose-500 text-white' : i+1 < step ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-indigo-800 text-indigo-700'}`}>
                      {i+1 < step ? '✓' : i+1}
                   </div>
                   <div>
                      <p className={`font-bold transition-colors ${step === i+1 ? 'text-white' : 'text-indigo-400'}`}>{s.title}</p>
                      <p className="text-xs text-indigo-500 font-medium">{s.desc}</p>
                   </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-4 h-4 text-rose-400" />
              <p className="text-sm font-bold text-rose-100 uppercase tracking-widest">Why this matters?</p>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed italic">
              {step === 1 && "Accurate income reporting allows our AI to calculate your real savings rate and suggest aggressive yet safe growth paths."}
              {step === 2 && "Identifying your fixed obligations helps us create an 'Emergency Fund' target, ensuring you never face a cash crunch."}
              {step === 3 && "Planning for non-essentials and taxes ensures we don't overestimate your investable surplus, keeping your goals realistic."}
              {step === 4 && "Your existing assets tell us where you currently stand. Our AI will audit this portfolio to find hidden risks and optimize for safety."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Pane */}
      <div className="flex-1 bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 border border-slate-100 flex flex-col justify-between min-h-[600px]">
        <div>
          <div className="mb-10">
            <h2 className="text-3xl font-black text-indigo-950 mb-2">Step {step}: {steps[step-1].title}</h2>
            <p className="text-slate-500 text-lg font-medium">Please provide {isBusiness ? 'your business' : 'your personal'} financial details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isBusiness && (
                      <div className="space-y-2">
                         <label className="block text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                         <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600" />
                            <input type="date" className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} required={!isBusiness} />
                         </div>
                         <p className="text-[10px] text-slate-400 font-medium ml-1">Used for age-based asset allocation rules.</p>
                      </div>
                    )}
                    <div className="space-y-2 col-span-full">
                       <label className="block text-sm font-bold text-slate-700 ml-1">{isBusiness ? 'Average Monthly Revenue' : 'Regular Monthly Income'}</label>
                       <div className="relative group">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600" />
                          <input 
                              type="number" 
                              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-xl text-indigo-950" 
                              placeholder={isBusiness ? 'e.g. 5,000,000' : 'e.g. 75,000'}
                              value={isBusiness ? formData.revenue : formData.income}
                              onChange={e => setFormData({...formData, [isBusiness ? 'revenue' : 'income']: e.target.value})}
                              required 
                          />
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isBusiness ? (
                       <>
                         <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Monthly Payroll</label>
                            <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Net salaries paid" value={formData.payroll} onChange={e => setFormData({...formData, payroll: e.target.value})} required />
                         </div>
                         <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">OpEx (Rent, Utilities, Adv)</label>
                            <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Business operational burn" value={formData.opex} onChange={e => setFormData({...formData, opex: e.target.value})} required />
                         </div>
                       </>
                    ) : (
                        <>
                        <div className="space-y-2">
                           <label className="block text-sm font-bold text-slate-700 ml-1">Rent / Home Loan EMI</label>
                           <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Monthly fixed accommodation cost" value={formData.rent_emi} onChange={e => setFormData({...formData, rent_emi: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                           <label className="block text-sm font-bold text-slate-700 ml-1">Essential Spends</label>
                           <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Groceries, Bills, School" value={formData.essential_expenses} onChange={e => setFormData({...formData, essential_expenses: e.target.value})} required />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck className="w-6 h-6 text-amber-600" />
                     </div>
                     <p className="text-xs text-amber-900 leading-relaxed font-medium">These figures are used to calculate your "Runway" — how many months you can survive without income. Be as precise as possible.</p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isBusiness ? (
                        <div className="space-y-2 col-span-full">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Annual Tax Liability</label>
                            <div className="relative">
                               <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                               <input type="number" className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-xl text-indigo-950" placeholder="Estimated annual tax load" value={formData.tax_liability} onChange={e => setFormData({...formData, tax_liability: e.target.value})} required />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Fun & Hobbies</label>
                                <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Gym, Eating out, Fun" value={formData.non_essential_expenses} onChange={e => setFormData({...formData, non_essential_expenses: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Other Planned Savings</label>
                                <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Education fund, Travel fund" value={formData.other_needs} onChange={e => setFormData({...formData, other_needs: e.target.value})} />
                            </div>
                        </>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700 ml-1">Existing Stocks Value</label>
                       <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Current market value" value={formData.initial_stocks} onChange={e => setFormData({...formData, initial_stocks: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700 ml-1">Mutual Funds Value</label>
                       <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Current NAV sum" value={formData.initial_mf} onChange={e => setFormData({...formData, initial_mf: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700 ml-1">Monthly SIPs (Active)</label>
                       <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Sum of current SIPs" value={formData.initial_sip} onChange={e => setFormData({...formData, initial_sip: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700 ml-1">Total FDs / Cash</label>
                       <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium" placeholder="Fixed deposits & savings" value={formData.initial_fd} onChange={e => setFormData({...formData, initial_fd: e.target.value})} />
                    </div>
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-xl shadow-indigo-100 shrink-0">
                      <Bot className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-black text-indigo-950 text-lg">Performing Deep Risk Audit...</p>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">AI will analyze asset concentration</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-10 border-t border-slate-100">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-slate-500 hover:text-indigo-950 transition-colors">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-indigo-950 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-900/20 hover:scale-[1.02] transition-all">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-[2rem] font-black shadow-xl shadow-rose-600/20 hover:scale-[1.02] transition-all" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Complete AI Discovery <Sparkles className="w-5 h-5" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
