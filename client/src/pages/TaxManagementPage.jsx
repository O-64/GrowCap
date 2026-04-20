import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Receipt, FileText, Calculator, ShieldCheck, ArrowRight, 
  Phone, Calendar, CheckCircle2, IndianRupee, TrendingDown,
  Building, Sparkles, Clock
} from 'lucide-react';

export default function TaxManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isBusiness = user?.user_type === 'business';

  const taxServices = isBusiness ? [
    { icon: Building, title: 'GST Filing & Compliance', desc: 'End-to-end GST returns, input tax credit optimization, and compliance management.', tag: 'Quarterly' },
    { icon: FileText, title: 'Corporate Tax Planning', desc: 'Strategic deductions, advance tax planning, and TDS management for maximum savings.', tag: 'Annual' },
    { icon: Calculator, title: 'Transfer Pricing Audit', desc: 'International pricing compliance and documentation for multi-entity businesses.', tag: 'On Demand' },
    { icon: TrendingDown, title: 'Tax Loss Harvesting', desc: 'Strategic realization of losses to offset capital gains and reduce tax liability.', tag: 'Quarterly' },
  ] : [
    { icon: Receipt, title: 'ITR Filing & Optimization', desc: 'Expert income tax return filing with maximum deductions under 80C, 80D, HRA, and more.', tag: 'Annual' },
    { icon: TrendingDown, title: 'Capital Gains Planning', desc: 'Strategic timing of equity/MF sales to minimize STCG and LTCG tax impact.', tag: 'Ongoing' },
    { icon: ShieldCheck, title: 'Tax-Saving Investments', desc: 'ELSS, NPS, PPF allocation advisory to maximize Section 80C benefits up to ₹1.5L.', tag: 'Annual' },
    { icon: Calculator, title: 'Advance Tax Advisory', desc: 'Quarterly advance tax calculations to avoid interest under 234B/234C.', tag: 'Quarterly' },
  ];

  const benefits = [
    'Dedicated tax advisor assigned to your profile',
    'Real-time tax liability tracking integrated with your portfolio',
    'Automated reminders for filing deadlines',
    'AI-powered deduction discovery from your financial profile',
    'WhatsApp-based document collection',
    'Post-filing audit support for 12 months'
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-indigo-950">
            {isBusiness ? 'Corporate Tax Management' : 'Personal Tax Management'}
          </h1>
          <p className="text-text-muted mt-1">Expert-led tax planning and filing services tailored to your financial profile</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/contact')}
          className="px-6 py-3 bg-indigo-950 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-900 transition-all flex items-center gap-2 shrink-0"
        >
          <Phone className="w-4 h-4" /> Schedule Tax Consultation
        </button>
      </div>

      {/* Hero CTA Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-rose-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <span className="text-rose-300 font-bold text-sm uppercase tracking-widest">Expert Advisory</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Save up to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">₹1,50,000</span> in taxes this year
            </h2>
            <p className="text-indigo-200 text-lg mb-6 max-w-lg">
              Our SEBI-registered tax experts analyze your portfolio, income streams, and obligations to find every legal deduction available to you.
            </p>
            <button 
              onClick={() => navigate('/dashboard/contact')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-950 rounded-2xl font-black shadow-2xl hover:shadow-rose-500/20 transition-all hover:-translate-y-0.5"
            >
              Book Free Tax Review <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="w-full max-w-xs bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-rose-400" />
              <div>
                <p className="font-bold text-sm">Next Available Slot</p>
                <p className="text-xs text-indigo-300">Today, 4:00 PM</p>
              </div>
            </div>
            <div className="space-y-3">
              {['ITR Filing', 'Capital Gains', 'Tax Saving'].map((tag, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-sm font-medium">{tag}</span>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-md">Available</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-lg font-black text-indigo-950 mb-4 uppercase tracking-tight">
          {isBusiness ? 'Business Tax Services' : 'Individual Tax Services'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taxServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <div 
                key={i} 
                className="glass-card hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => navigate('/dashboard/contact')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-rose-50 flex items-center justify-center shrink-0 group-hover:from-indigo-200 group-hover:to-rose-100 transition-all">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-indigo-950">{service.title}</h4>
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{service.tag}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                      Schedule Call <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="glass-card bg-emerald-50/30 border-emerald-100">
        <h3 className="text-lg font-black text-indigo-950 mb-4 uppercase tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What You Get
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-indigo-950 rounded-3xl p-8 text-center text-white shadow-2xl">
        <Clock className="w-10 h-10 mx-auto text-rose-400 mb-4" />
        <h3 className="text-2xl font-black mb-2">Don't Wait Until Last Minute</h3>
        <p className="text-indigo-200 mb-6 max-w-md mx-auto">
          ITR filing deadline is approaching. Book your tax consultation now and let our experts handle everything.
        </p>
        <button 
          onClick={() => navigate('/dashboard/contact')}
          className="px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-2xl font-black shadow-xl hover:shadow-rose-500/30 transition-all inline-flex items-center gap-2"
        >
          <Phone className="w-5 h-5" /> Schedule Tax Call Now
        </button>
      </div>
    </div>
  );
}
