import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Target, Calculator, ShieldAlert, BarChart3, Bot, ArrowRight, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: false }
  };

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
      <section className="relative pt-32 pb-40 overflow-hidden bg-slate-900 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            src="/images/hero-bg.png" 
            alt="Premium Wealth Management" 
            className="w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 bg-indigo-950/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-50" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block py-1.5 px-4 rounded-full bg-rose-500/20 text-rose-200 font-bold text-sm tracking-wide mb-8 border border-rose-500/30 backdrop-blur-md shadow-lg"
          >
            India's Leading Wealth Platform
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-10 drop-shadow-2xl"
          >
            Build Wealth. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-indigo-300">Secure Your Legacy.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-100 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg"
          >
            Expert-curated portfolios, AI-driven insights, and dedicated tax planning tailored specifically for ambitious businesses and middle-class professionals.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center"
          >
            <Link to={user ? "/dashboard" : "/login"} className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 rounded-full overflow-hidden shadow-2xl hover:shadow-rose-500/50 transition-all hover:-translate-y-1 z-20">
              <span className="mr-2 text-xl">{user ? 'Access Dashboard' : 'Manage Portfolio'}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Table/Grid */}
      <section id="services" className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            {...fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-indigo-950 mb-6 tracking-tight">Comprehensive Wealth Management</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">A systematic, specific approach to your finances.</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: Target, title: "1. Financial Planning", text: "An expert-curated personalised financial plan that helps you navigate the best way to achieve your goals.", color: "bg-indigo-50/50 border-indigo-100", iconColor: "text-indigo-600", hover: "hover:bg-indigo-100/50 hover:border-indigo-300" },
              { icon: Calculator, title: "2. Tax Planning", text: "Complete tax planning guidance to ensure maximum savings and optimal business deductions.", color: "bg-rose-50/50 border-rose-100", iconColor: "text-rose-600", hover: "hover:bg-rose-100/50 hover:border-rose-300" },
              { icon: BarChart3, title: "3. Retirement Planning", text: "Retire on your terms and live a financially secure retired life with your desired passive income stream.", color: "bg-amber-50/50 border-amber-100", iconColor: "text-amber-600", hover: "hover:bg-amber-100/50 hover:border-amber-300" },
              { icon: TrendingUp, title: "4. Equity Management", text: "Private equity management for effective wealth creation via Stocks, ETFs, and premium direct Mutual Funds.", color: "bg-emerald-50/50 border-emerald-100", iconColor: "text-emerald-600", hover: "hover:bg-emerald-100/50 hover:border-emerald-300" },
              { icon: ShieldAlert, title: "5. Risk Management", text: "Get tailored protection and risk management solutions to mitigate risk exposures across your corporate and personal ledgers.", color: "bg-blue-50/50 border-blue-100", iconColor: "text-blue-600", hover: "hover:bg-blue-100/50 hover:border-blue-300" }
            ].map((service, index) => (
              <motion.div 
                key={index}
                variants={{
                  initial: { opacity: 0, y: 40 },
                  whileInView: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                }}
                className={`${service.color} ${service.hover} p-10 rounded-[2.5rem] shadow-sm border transition-all duration-300 group ${index === 4 ? 'md:col-span-2 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center' : ''}`}
              >
                <div className={`${index === 4 ? 'flex flex-col h-full justify-center' : ''}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-black text-indigo-950 mb-4">{service.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">{service.text}</p>
                </div>
                {index === 4 && (
                  <div className="hidden lg:block">
                     <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 shadow-inner">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                              <ShieldCheck className="w-6 h-6" />
                           </div>
                           <p className="font-bold text-indigo-950">Active Protection</p>
                        </div>
                        <div className="space-y-2">
                           <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: '85%' }}
                                transition={{ duration: 1, delay: 1 }}
                                className="h-full bg-blue-500" 
                              />
                           </div>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Risk Mitigation Score: 85%</p>
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Engine Section */}
      <section id="ai" className="py-32 bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <motion.img 
            initial={{ scale: 1.2 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 2 }}
            src="https://images.unsplash.com/photo-1620714223084-8b8393e802ee?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="AI Network" 
           />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            {...fadeIn}
            className="flex-1"
          >
            <span className="text-rose-400 font-extrabold tracking-[0.2em] text-sm uppercase mb-6 block">Proprietary Technology</span>
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">AI-Based Portfolio Management</h2>
            <p className="text-indigo-200 text-xl mb-10 leading-relaxed">
              Experience the power of Groq LLM integrated with elite Retrieval-Augmented Generation (RAG). 
              Our AI constantly ingests validated market data from our cloud database to provide you with split-second, highly-accurate financial advisory.
            </p>
            <ul className="space-y-6">
              {[
                "Read-only locked corporate data vaults",
                "Automated WhatsApp plan delivery",
                "Real-time line charts mapping global indexes"
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-4 text-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <ShieldCheck className="text-rose-400 w-4 h-4" /> 
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">GrowCap AI Analyst</h3>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-widest">Online • Ultra Secure</p>
              </div>
            </div>
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/10 p-5 rounded-3xl rounded-tl-sm text-lg border border-white/5"
              >
                "Based on your income profile, I suggest routing 20% into diversified ETFs. Would you like me to allocate this?"
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-rose-600/40 p-5 rounded-3xl rounded-tr-sm text-lg text-right ml-12 border border-rose-500/30"
              >
                "Apply the recommended plan and send to my WhatsApp."
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AUM Growth Chart */}
      <section id="growth" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            {...fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-indigo-950 mb-4 tracking-tight">Unprecedented Growth</h2>
            <p className="text-xl text-slate-600">Year on year growth in Assets Under Tracking (in ₹ Crores)</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="h-[500px] w-full bg-slate-50 border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-indigo-100/50"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dx={-15} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                <Bar dataKey="aum" fill="url(#barGradient)" radius={[10, 10, 0, 0]} activeBar={{fill: '#312e81'}} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            {...fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-indigo-950 mb-6 tracking-tight">Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Simple flat-fee structures for honest wealth management.</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: false }}
            className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto"
          >
            <motion.div 
              variants={fadeIn}
              className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden flex flex-col"
            >
              <h3 className="text-2xl font-bold text-indigo-950 mb-3">Individual Planning</h3>
              <p className="text-slate-500 mb-8 pb-8 border-b border-slate-100 text-lg">For middle-class professionals.</p>
              <p className="text-5xl font-black text-indigo-950 mb-10">₹1,499 <span className="text-xl font-normal text-slate-500">/year</span></p>
              <ul className="space-y-5 mb-12 flex-grow">
                <li className="flex items-center gap-4 text-slate-700 font-medium"><CheckCircle2 className="text-rose-600 w-6 h-6" /> <span>AI Portfolio Management</span></li>
                <li className="flex items-center gap-4 text-slate-700 font-medium"><CheckCircle2 className="text-rose-600 w-6 h-6" /> <span>WhatsApp Alerts & Plans</span></li>
                <li className="flex items-center gap-4 text-slate-700 font-medium"><CheckCircle2 className="text-rose-600 w-6 h-6" /> <span>Tax Optimization Dashboard</span></li>
              </ul>
              <Link to="/register" className="block w-full py-5 px-6 rounded-2xl text-center font-bold border-2 border-indigo-950 text-indigo-950 hover:bg-indigo-950 hover:text-white transition-all text-xl">Start Free Trial</Link>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="bg-indigo-950 p-12 rounded-[2.5rem] shadow-2xl border border-indigo-900 relative overflow-hidden text-white flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-xs font-bold px-5 py-2 rounded-bl-2xl uppercase tracking-[0.2em]">Most Popular</div>
              <h3 className="text-2xl font-bold mb-3">Business Command</h3>
              <p className="text-indigo-300 mb-8 pb-8 border-b border-indigo-800 text-lg">For aggressive scale enterprises.</p>
              <p className="text-5xl font-black mb-10">₹9,999 <span className="text-xl font-normal text-indigo-300">/year</span></p>
              <ul className="space-y-5 mb-12 flex-grow">
                <li className="flex items-center gap-4 text-indigo-100 font-medium"><CheckCircle2 className="text-rose-400 w-6 h-6" /> <span>B2B Invoicing & Cash Flow AI</span></li>
                <li className="flex items-center gap-4 text-indigo-100 font-medium"><CheckCircle2 className="text-rose-400 w-6 h-6" /> <span>Document Upload via RAG</span></li>
                <li className="flex items-center gap-4 text-indigo-100 font-medium"><CheckCircle2 className="text-rose-400 w-6 h-6" /> <span>Dedicated Corporate Tax Advisor</span></li>
              </ul>
              <Link to="/register" className="block w-full py-5 px-6 rounded-2xl text-center font-bold bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-xl hover:shadow-rose-600/40 transition-all text-xl">Enroll Business</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Speak to an Expert CTA */}
      <section className="py-20 bg-indigo-950/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
            className="bg-white rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-indigo-200/50 border border-indigo-100 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full -ml-40 -mb-40 blur-3xl opacity-50" />
            
            <div className="flex-1 relative z-10 text-center md:text-left">
              <span className="text-rose-600 font-extrabold tracking-[0.2em] text-sm uppercase mb-6 block">Expert Guidance</span>
              <h2 className="text-4xl md:text-6xl font-black text-indigo-950 mb-8 leading-tight">
                Schedule a priority call with <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600">our financial experts.</span>
              </h2>
              <p className="text-slate-600 text-xl mb-12 max-w-2xl leading-relaxed">
                Get a personalized demo of our platform or a complete portfolio audit from industry veterans. 
                Your first 30-minute consultation is completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <Link to="/register" className="px-10 py-5 bg-indigo-950 text-white rounded-2xl font-bold shadow-2xl hover:bg-indigo-900 transition-all flex items-center justify-center gap-3 text-xl">
                  Book Free Consultation <ArrowRight className="w-6 h-6" />
                </Link>
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex -space-x-4">
                    {[
                      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100",
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100",
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                    ].map((img, i) => (
                      <motion.img 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        src={img} 
                        className="w-12 h-12 rounded-full border-4 border-white shadow-lg" 
                        alt="Advisor" 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Experts waiting</span>
                </div>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 w-full max-w-md relative z-10"
            >
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-inner">
                <div className="flex items-center gap-5 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
                      <Calendar className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="font-bold text-xl text-indigo-950">Availability</p>
                      <p className="text-sm text-slate-600 font-medium">Next slot: Today, 4:00 PM</p>
                   </div>
                </div>
                <div className="space-y-4">
                  {['Wealth Management', 'Corporate Tax', 'AI Indexing'].map((tag, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200"
                    >
                       <span className="font-bold text-slate-700">{tag}</span>
                       <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">Available</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
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
