import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';
import { TrendingUp, User, Mail, Lock, Building, ArrowRight, Wallet, Phone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const [userType, setUserType] = useState('individual');
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', whatsapp_number: '',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        user_type: userType
      };
      const { data } = await register(payload);
      loginUser(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Pane - Branding & Features (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000" 
            alt="Data Analysis" 
            className="w-full h-full object-cover opacity-20 scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-indigo-900/80 to-indigo-950" />
        </div>

        <div className="relative z-10 max-w-lg px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-500 flex items-center justify-center shadow-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight tracking-tight">GrowCap</h2>
            </div>
            
            <h1 className="text-5xl font-black leading-tight mb-8">
              Start your journey to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">Financial Freedom.</span>
            </h1>
            
            <div className="space-y-4 mb-12">
               {[
                 "Personalized Wealth Management",
                 "Business Cash Flow Optimization",
                 "Automated Tax Planning",
                 "AI-Powered Market Insights"
               ].map((text, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-3 text-indigo-200"
                 >
                   <CheckCircle2 className="w-5 h-5 text-rose-500" />
                   <span className="text-lg font-medium">{text}</span>
                 </motion.div>
               ))}
            </div>

            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <p className="text-indigo-100 italic text-lg mb-4">"GrowCap helped me structure my business investments and save over 15% on taxes annually."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-rose-400">RK</div>
                <div>
                  <p className="font-bold">Rahul Kapoor</p>
                  <p className="text-xs text-indigo-300">CEO, TechScale India</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Right Pane - Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 relative bg-slate-50 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-indigo-950">GrowCap</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-black text-indigo-950 mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-500 text-lg font-medium">Join 10,000+ users building wealth.</p>
          </div>

          {/* User Type Tab */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => setUserType('individual')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${userType === 'individual' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <User className="w-4 h-4" /> Individual
            </button>
            <button 
              type="button"
              onClick={() => setUserType('business')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${userType === 'business' ? 'bg-indigo-950 shadow-lg text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Building className="w-4 h-4" /> Business
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                  placeholder="John Doe" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                    placeholder="john@example.com" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                    placeholder="Min. 6 characters" 
                    required 
                    minLength={6} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="tel" 
                  value={form.whatsapp_number} 
                  onChange={e => setForm({...form, whatsapp_number: e.target.value})} 
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                  placeholder="+91..." 
                />
              </div>
            </div>

            <AnimatePresence>
              {userType === 'business' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="text" 
                        value={form.company_name} 
                        onChange={e => setForm({...form, company_name: e.target.value})} 
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800 border-indigo-200"
                        placeholder="Acme Inc" 
                        required 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl text-white group ${userType === 'business' ? 'bg-indigo-950 shadow-indigo-900/10 hover:bg-slate-900' : 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-700'}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">Create Secure Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-black hover:text-rose-600 transition-colors underline decoration-2 underline-offset-4">Sign in here</Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
