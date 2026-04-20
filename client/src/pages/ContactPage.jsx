import { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Clock, Calendar, CheckCircle2, User, Briefcase, Star, ArrowRight, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { bookAppointment, getAppointments } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';

const ADVISORS = [
  {
    id: 1,
    name: 'Rajesh Malhotra',
    title: 'Senior Wealth Strategist',
    specialization: 'Portfolio Management & HNI Planning',
    experience: '15+ Years (Ex-Goldman Sachs)',
    phone: '+91 98765 00101',
    email: 'rajesh.m@growcap.in',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 2,
    name: 'Sneha Gupta',
    title: 'Tax & Audit Consultant',
    specialization: 'Corporate Tax & GST Optimization',
    experience: '12+ Years (CA, CS)',
    phone: '+91 98765 00102',
    email: 'sneha.g@growcap.in',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 3,
    name: 'Vikram Iyer',
    title: 'AI Portfolio Architect',
    specialization: 'Quantitative Analysis & Indexing',
    experience: '8+ Years (IIT Bombay)',
    phone: '+91 98765 00103',
    email: 'vikram.i@growcap.in',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  }
];

const REQUIREMENT_TYPES = [
  'Portfolio Audit',
  'Tax Planning',
  'Retirement Consultation',
  'Business Cash Flow Demo',
  'Risk Exposure Analysis',
  'General Inquiry'
];

export default function ContactPage() {
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    requirement: '',
    date: '',
    time: '',
    message: ''
  });

  useEffect(() => { loadAppointments(); }, []);

  async function loadAppointments() {
    try { const { data } = await getAppointments(); setAppointments(data); } catch (err) { console.error(err); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookAppointment({
        advisor_name: selectedAdvisor?.name || 'General Advisor',
        requirement: form.requirement,
        date: form.date,
        time: form.time
      });
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', requirement: '', date: '', time: '', message: '' });
      setSelectedAdvisor(null);
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForm = (advisor) => {
    setSelectedAdvisor(advisor);
    setForm(prev => ({ ...prev, requirement: advisor ? `Consultation with ${advisor.name}` : '' }));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Speak to an Expert</h1>
          <p className="text-text-muted mt-1">Connect with our top financial managers and advisors for personalized guidance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
             {ADVISORS.map(a => (
               <img key={a.id} src={a.image} alt={a.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
             ))}
          </div>
          <span className="text-sm font-semibold text-primary">3 Experts Online</span>
        </div>
      </div>

      {/* Advisor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ADVISORS.map((advisor) => (
          <div key={advisor.id} className="glass-card flex flex-col h-full hover:border-primary/30 transition-all group">
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <img src={advisor.image} alt={advisor.name} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-success w-5 h-5 rounded-full border-4 border-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{advisor.name}</h3>
                  <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{advisor.rating}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary-dark">{advisor.title}</p>
                <div className="flex items-center gap-1 text-text-muted text-xs mt-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{advisor.experience}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-1">
               <div className="p-3 bg-surface-light rounded-xl border border-border/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Expertise</p>
                  <p className="text-sm font-medium">{advisor.specialization}</p>
               </div>
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3 text-sm text-text-muted">
                   <Phone className="w-4 h-4 text-primary" />
                   <span>{advisor.phone}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-text-muted">
                   <Mail className="w-4 h-4 text-primary" />
                   <span>{advisor.email}</span>
                 </div>
               </div>
            </div>

            <button 
              onClick={() => openForm(advisor)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg hover:shadow-primary/30"
            >
              <Calendar className="w-4 h-4" />
              Schedule Call
            </button>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments Section */}
      {appointments.length > 0 && (
        <div className="animate-fade-in mb-12">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                 <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight">My Scheduled Consultations</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.slice(0, 3).map(appt => (
                <AppointmentCard key={appt.id} appointment={appt} />
              ))}
              {appointments.length > 3 && (
                <div className="glass-card flex items-center justify-center bg-indigo-50/20 border-dashed">
                   <p className="text-xs font-bold text-indigo-400">+{appointments.length - 3} more sessions scheduled</p>
                </div>
              )}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Support Channels */}
        <div className="space-y-6">
          <div className="glass-card bg-indigo-950 text-white border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-3xl" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-rose-400" />
              Other Ways to Reach Us
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Toll-Free Helpline</p>
                  <p className="text-lg font-bold">1800 500 9000</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">WhatsApp Support</p>
                  <p className="text-lg font-bold">+91 91234 56789</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Support Hours</p>
                  <p className="text-lg font-bold">Mon - Sat: 9am - 8pm IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4">Why talk to our advisors?</h3>
            <ul className="space-y-3">
              {[
                'Unbiased, conflict-free financial advice',
                'Deep-dive into tax saving opportunities',
                'Custom portfolio rebalancing strategy',
                'Advanced risk management solutions',
                'Priority support for business clients'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Appointment Form */}
        <div id="appointment-form" className="glass-card shadow-xl border-primary/10 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Book an Appointment</h3>
            {selectedAdvisor && (
              <button onClick={() => setSelectedAdvisor(null)} className="text-xs text-primary hover:underline font-bold">Clear Selection</button>
            )}
          </div>

          {submitted ? (
            <div className="py-12 text-center animate-scale-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h4>
              <p className="text-text-muted mb-8">One of our advisors will contact you shortly to confirm your slot.</p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary">Submit another request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedAdvisor && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 mb-2 animate-fade-in">
                  <img src={selectedAdvisor.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-primary uppercase">Booking with</p>
                    <p className="font-bold text-slate-900">{selectedAdvisor.name}</p>
                  </div>
                  <User className="text-primary w-5 h-5 opacity-30" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                     <input 
                      type="text" 
                      className="input-field pl-10" 
                      placeholder="John Doe" 
                      required 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                  <div className="relative">
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                     <input 
                      type="tel" 
                      className="input-field pl-10" 
                      placeholder="+91 98XXX XXXXX" 
                      required 
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                   <input 
                    type="email" 
                    className="input-field pl-10" 
                    placeholder="john@example.com" 
                    required 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Requirement Category</label>
                <select 
                  className="input-field" 
                  required
                  value={form.requirement}
                  onChange={e => setForm({...form, requirement: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {REQUIREMENT_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Preferred Date</label>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                     <input 
                      type="date" 
                      className="input-field pl-10" 
                      required 
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Preferred Time</label>
                  <div className="relative">
                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                     <input 
                      type="time" 
                      className="input-field pl-10" 
                      required 
                      value={form.time}
                      onChange={e => setForm({...form, time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Complete Booking
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-text-muted px-6">
                By booking, you agree to our Terms of Service. Our team typically responds within 2 business hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
