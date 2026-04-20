import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Target, Calculator, ShieldAlert, BarChart3, Bot, ArrowRight, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function LandingPage() {
  const { user, logout } = useAuth();

  useEffect(() => {
    // Force logout on landing page visit as requested to ensure fresh login/signup
    logout();
  }, [logout]);
  
  const yoyData = [
    { year: '2021', aum: 50 },
    { year: '2022', aum: 120 },
    { year: '2023', aum: 310 },
    { year: '2024', aum: 850 },
    { year: '2025', aum: 2100 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-rose-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-indigo-950">GrowCap</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#services" className="hover:text-rose-600 transition-colors">Services</a>
            <a href="#growth" className="hover:text-rose-600 transition-colors">Growth</a>
            <a href="#ai" className="hover:text-rose-600 transition-colors">AI Engine</a>
            <a href="#pricing" className="hover:text-rose-600 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-indigo-950 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-800 transition-all shadow-md">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-indigo-900 hover:text-rose-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-indigo-950 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-800 transition-all shadow-md">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=2000" alt="AI Finance Network" className="w-full h-full object-cover opacity-100 object-center" />
          <div className="absolute inset-0 bg-blue-950/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-50" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-500/20 text-rose-200 font-bold text-sm tracking-wide mb-6 border border-rose-500/30 backdrop-blur-md">
            India's Leading Wealth Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-8 drop-shadow-lg">
            Build Wealth. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">Secure Your Legacy.</span>
          </h1>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Expert-curated portfolios, AI-driven insights, and dedicated tax planning tailored specifically for ambitious businesses and middle-class professionals.
          </p>
          <div className="flex justify-center mb-16">
            <Link to={user ? "/dashboard" : "/login"} className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-500 rounded-full overflow-hidden shadow-2xl hover:shadow-rose-500/50 transition-all hover:-translate-y-1 z-20">
              <span className="mr-2 text-lg">{user ? 'Access Dashboard' : 'Manage Portfolio'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Table/Grid */}
      <section id="services" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-indigo-950 mb-4">Comprehensive Wealth Management</h2>
            <p className="text-slate-600">A systematic, specific approach to your finances.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
              <Target className="w-10 h-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold text-indigo-950 mb-3">1. Financial Planning</h3>
              <p className="text-slate-600">An expert-curated personalised financial plan that helps you navigate the best way to achieve your goals.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
              <Calculator className="w-10 h-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold text-indigo-950 mb-3">2. Tax Planning</h3>
              <p className="text-slate-600">Complete tax planning guidance to ensure maximum savings and optimal business deductions.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
              <BarChart3 className="w-10 h-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold text-indigo-950 mb-3">3. Retirement Planning</h3>
              <p className="text-slate-600">Retire on your terms and live a financially secure retired life with your desired passive income stream.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors md:col-span-1 lg:col-span-1">
              <TrendingUp className="w-10 h-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold text-indigo-950 mb-3">4. Equity Management</h3>
              <p className="text-slate-600">Private equity management for effective wealth creation via Stocks, ETFs, and premium direct Mutual Funds.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors md:col-span-2 lg:col-span-2">
              <ShieldAlert className="w-10 h-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold text-indigo-950 mb-3">5. Risk Management</h3>
              <p className="text-slate-600">Get tailored protection and risk management solutions to mitigate risk exposures across your corporate and personal ledgers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Section */}
      <section id="ai" className="py-24 bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img src="https://images.unsplash.com/photo-1620714223084-8b8393e802ee?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="AI Network" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-rose-400 font-bold tracking-widest text-sm uppercase mb-4 block">Proprietary Technology</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6">AI-Based Portfolio Management</h2>
            <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
              Experience the power of Groq LLM integrated with elite Retrieval-Augmented Generation (RAG). 
              Our AI constantly ingests validated market data from our cloud database to provide you with split-second, highly-accurate financial advisory.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><ShieldCheck className="text-rose-500 w-6 h-6" /> <span>Read-only locked corporate data vaults</span></li>
              <li className="flex items-center gap-3"><ShieldCheck className="text-rose-500 w-6 h-6" /> <span>Automated WhatsApp plan delivery</span></li>
              <li className="flex items-center gap-3"><ShieldCheck className="text-rose-500 w-6 h-6" /> <span>Real-time line charts mapping global indexes</span></li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
              <Bot className="w-8 h-8 text-rose-400" />
              <div>
                <h3 className="font-bold">GrowCap AI Analyst</h3>
                <p className="text-xs text-indigo-300">Online • Secure connection</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                "Based on your income profile, I suggest routing 20% into diversified ETFs. Would you like me to allocate this?"
              </div>
              <div className="bg-rose-600/30 p-4 rounded-2xl rounded-tr-sm text-sm text-right ml-12 border border-rose-500/30">
                "Apply the recommended plan and send to my WhatsApp."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUM Growth Chart */}
      <section id="growth" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-indigo-950 mb-4">Unprecedented Growth</h2>
            <p className="text-slate-600">Year on year growth in Assets Under Tracking (in ₹ Crores)</p>
          </div>
          <div className="h-96 w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="aum" fill="#4f46e5" radius={[6, 6, 0, 0]} activeBar={{fill: '#e11d48'}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-indigo-950 mb-4">Transparent Pricing</h2>
            <p className="text-slate-600">Simple flat-fee structures for honest wealth management.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <h3 className="text-xl font-bold text-indigo-950 mb-2">Individual Planning</h3>
              <p className="text-slate-500 mb-6 pb-6 border-b border-slate-100">For middle-class professionals.</p>
              <p className="text-4xl font-black text-indigo-950 mb-6">₹1,499 <span className="text-base font-normal text-slate-500">/year</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-rose-600 w-5 h-5" /> <span className="text-slate-600">AI Portfolio Management</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-rose-600 w-5 h-5" /> <span className="text-slate-600">WhatsApp Alerts & Plans</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-rose-600 w-5 h-5" /> <span className="text-slate-600">Tax Optimization Dashboard</span></li>
              </ul>
              <Link to="/register" className="block w-full py-3 px-4 rounded-xl text-center font-bold border-2 border-indigo-950 text-indigo-950 hover:bg-indigo-950 hover:text-white transition-colors">Start Free Trial</Link>
            </div>
            
            <div className="bg-indigo-950 p-8 rounded-3xl shadow-xl border border-indigo-900 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Business Command</h3>
              <p className="text-indigo-300 mb-6 pb-6 border-b border-indigo-800">For aggressive scale enterprises.</p>
              <p className="text-4xl font-black mb-6">₹9,999 <span className="text-base font-normal text-indigo-300">/year</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-rose-400 w-5 h-5" /> <span className="text-indigo-100">B2B Invoicing & Cash Flow AI</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-rose-400 w-5 h-5" /> <span className="text-indigo-100">Document Upload via RAG</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-rose-400 w-5 h-5" /> <span className="text-indigo-100">Dedicated Corporate Tax Advisor</span></li>
              </ul>
              <Link to="/register" className="block w-full py-3 px-4 rounded-xl text-center font-bold bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg hover:shadow-rose-600/30 transition-all">Enroll Business</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Speak to an Expert CTA */}
      <section className="py-20 bg-indigo-950/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-indigo-200/50 border border-indigo-100 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <div className="flex-1 relative z-10 text-center md:text-left">
              <span className="text-rose-600 font-bold tracking-widest text-sm uppercase mb-4 block">Expert Guidance</span>
              <h2 className="text-4xl font-black text-indigo-950 mb-6 leading-tight">
                Schedule a priority call with <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600">our financial experts today.</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 max-w-xl">
                Get a personalized demo of our platform or a complete portfolio audit from industry veterans. 
                Your first 30-minute consultation is completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="px-8 py-4 bg-indigo-950 text-white rounded-full font-bold shadow-xl hover:bg-indigo-900 transition-all flex items-center justify-center gap-2">
                  Book Free Consultation <ArrowRight className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex -space-x-3">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-full border-2 border-white" alt="Advisor" />
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-full border-2 border-white" alt="Advisor" />
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-full border-2 border-white" alt="Advisor" />
                  </div>
                  <span className="text-sm font-semibold text-slate-500">Experts waiting for you</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md relative z-10">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Calendar className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="font-bold text-indigo-950">Upcoming Availability</p>
                      <p className="text-xs text-slate-500">Next available slot: Today, 4:00 PM</p>
                   </div>
                </div>
                <div className="space-y-3">
                  {['Wealth Management', 'Corporate Tax', 'AI Indexing'].map((tag, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                       <span className="text-sm font-medium text-slate-700">{tag}</span>
                       <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Available</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-rose-600" />
              <h2 className="text-2xl font-black text-indigo-950">GrowCap</h2>
            </div>
            <p className="text-slate-500 max-w-sm mb-6">Securing the financial future for the ambitious middle class and scaling businesses.</p>
          </div>
          <div>
            <h4 className="font-bold text-indigo-950 mb-4">Contact Us</h4>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-rose-600" /> support@growcap.in</li>
              <li className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-rose-600" /> +91 98765 43210</li>
              <li className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-rose-600" /> BKC, Mumbai, India 400051</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-indigo-950 mb-4">Legal</h4>
            <ul className="space-y-3 text-slate-600">
              <li className="text-sm hover:text-indigo-950 cursor-pointer">Privacy Policy</li>
              <li className="text-sm hover:text-indigo-950 cursor-pointer">Terms of Service</li>
              <li className="text-sm hover:text-indigo-950 cursor-pointer">SEBI Registration</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-400 text-sm mt-16 pb-4 border-t border-slate-100 pt-8 max-w-7xl mx-auto px-6">
          © 2026 GrowCap Wealth Platform. All rights reserved. Not affiliated with Dezerv or Fintoo directly.
        </div>
      </footer>
    </div>
  );
}
