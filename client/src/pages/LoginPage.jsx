import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { TrendingUp, Mail, Lock, ArrowRight, ShieldCheck, PieChart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      loginUser(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Pane - Visual & Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000" 
            alt="Wealth Management" 
            className="w-full h-full object-cover opacity-30 scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-900/80 to-rose-900/40" />
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
              <h2 className="text-3xl font-black tracking-tight">GrowCap</h2>
            </div>
            
            <h1 className="text-5xl font-black leading-tight mb-8">
              Empowering the <br />
              <span className="text-rose-400">Ambitious</span> to build <br />
              lasting wealth.
            </h1>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, text: "Enterprise-grade data security" },
                { icon: PieChart, text: "AI-driven portfolio optimizations" },
                { icon: Sparkles, text: "Exclusive tax management strategies" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-4 text-indigo-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <item.icon className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="font-medium text-lg">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Right Pane - Authentication Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 relative bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-indigo-950">GrowCap</h2>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-indigo-950 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-lg font-medium">Log in to manage your strategic portfolio.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-lg font-medium shadow-sm" 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <Link to="#" className="text-xs font-bold text-indigo-600 hover:text-rose-600 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all text-lg font-medium shadow-sm" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-indigo-950 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-900 active:scale-[0.98] transition-all shadow-xl shadow-indigo-900/10 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">Sign In to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-slate-500 font-medium">
              New to GrowCap?{' '}
              <Link to="/register" className="text-indigo-600 font-black hover:text-rose-600 transition-colors underline decoration-2 underline-offset-4">Create an account</Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
