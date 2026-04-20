import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';
import { TrendingUp, User, Mail, Lock, Building, ArrowRight, Wallet, Phone } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-card w-full max-w-md relative animate-fade-in my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold glow-text">Create Account</h1>
          <p className="text-text-muted mt-1">Join GrowCap to manage your finances</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex bg-surface-lighter p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => setUserType('individual')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${userType === 'individual' ? 'bg-surface shadow-md text-primary-light' : 'text-text-muted hover:text-text'}`}
          >
            <User className="w-4 h-4" /> Individual
          </button>
          <button 
            type="button"
            onClick={() => setUserType('business')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${userType === 'business' ? 'bg-surface shadow-md text-accent' : 'text-text-muted hover:text-text'}`}
          >
            <Building className="w-4 h-4" /> Business
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name / Contact Person</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field pl-10" placeholder="John Doe" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field pl-10" placeholder="Min 6 characters" required minLength={6} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="tel" value={form.whatsapp_number} onChange={e => setForm({...form, whatsapp_number: e.target.value})} className="input-field pl-10" placeholder="+91 9876543210" />
            </div>
          </div>

          {userType === 'business' && (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="input-field pl-10" placeholder="Acme Inc" required />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className={`btn w-full flex items-center justify-center gap-2 py-3 mt-4 text-white hover:opacity-90 ${userType === 'business' ? 'bg-accent' : 'bg-primary'}`}>
            {loading ? 'Creating...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center mt-6 text-text-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
