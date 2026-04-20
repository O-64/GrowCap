import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getDiscoveryData } from '../services/api';
import { User, Mail, Phone, Calendar, IndianRupee, Building, Briefcase, Users, Save, Loader2, ShieldCheck, Edit3, CheckCircle2, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const { data } = await getProfile();
      setProfile(data);
      setForm({
        name: data.name || '',
        whatsapp_number: data.whatsapp_number || '',
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
        monthly_income: data.monthly_income || '',
        company_name: data.business_profile?.company_name || '',
        industry: data.business_profile?.industry || '',
        employees: data.business_profile?.employees || '',
      });
      const { data: disc } = await getDiscoveryData().catch(() => ({ data: null }));
      setDiscovery(disc);
    } catch (err) { console.error(err); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      await loadProfile();
      setEditing(false);
    } catch (err) { console.error(err); alert('Failed to save'); }
    finally { setSaving(false); }
  }

  const isBusiness = user?.user_type === 'business';

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBusiness ? 'Company Profile' : 'My Profile'}</h1>
          <p className="text-text-muted mt-1">Manage your personal and financial details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl font-black text-white shadow-lg ${isBusiness ? 'from-accent to-primary' : 'from-primary to-accent'}`}>
            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-black text-indigo-950">{profile.name}</h2>
            <p className="text-sm text-text-muted">{profile.email}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isBusiness ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
              {isBusiness ? 'Business Account' : 'Individual Account'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Personal Details
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
              {editing ? (
                <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              ) : (
                <p className="text-sm font-medium">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">WhatsApp</label>
              {editing ? (
                <input type="tel" className="input-field" value={form.whatsapp_number} onChange={e => setForm({...form, whatsapp_number: e.target.value})} />
              ) : (
                <p className="text-sm font-medium">{profile.whatsapp_number || 'Not set'}</p>
              )}
            </div>
            {!isBusiness && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                {editing ? (
                  <input type="date" className="input-field" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                ) : (
                  <p className="text-sm font-medium">{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : 'Not set'}</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{isBusiness ? 'Monthly Revenue' : 'Monthly Income'}</label>
              {editing ? (
                <input type="number" className="input-field" value={form.monthly_income} onChange={e => setForm({...form, monthly_income: e.target.value})} />
              ) : (
                <p className="text-sm font-bold text-primary">₹{parseFloat(profile.monthly_income || 0).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Business Info / Financial Summary */}
          <div className="space-y-4">
            {isBusiness ? (
              <>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" /> Company Details
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Company Name</label>
                  {editing ? (
                    <input type="text" className="input-field" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
                  ) : (
                    <p className="text-sm font-medium">{profile.business_profile?.company_name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Industry</label>
                  {editing ? (
                    <select className="input-field" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}>
                      {['Tech', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Services', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{profile.business_profile?.industry || 'Other'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Employees</label>
                  {editing ? (
                    <input type="number" className="input-field" value={form.employees} onChange={e => setForm({...form, employees: e.target.value})} />
                  ) : (
                    <p className="text-sm font-medium">{profile.business_profile?.employees || 1}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5" /> Financial Snapshot
                </h3>
                {discovery ? (
                  <div className="space-y-3">
                    {[
                      { label: 'Essential Expenses', value: discovery.essential_expenses },
                      { label: 'Non-Essential', value: discovery.non_essential_expenses },
                      { label: 'Rent / EMI', value: discovery.rent_emi },
                      { label: 'Other Needs', value: discovery.other_needs },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-bold">{item.label}</span>
                        <span className="text-sm font-bold text-indigo-950">₹{parseFloat(item.value || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">Complete Discovery to see your financial snapshot.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Risk Profile */}
      {discovery?.ai_risk_score && (
        <div className="glass-card bg-indigo-50/30 border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest">AI Risk Profile</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className={`px-4 py-2 rounded-xl font-black text-sm ${
              discovery.ai_risk_score === 'Low' ? 'bg-emerald-100 text-emerald-700' :
              discovery.ai_risk_score === 'High' ? 'bg-rose-100 text-rose-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {discovery.ai_risk_score} Risk
            </div>
            <p className="text-xs text-slate-600 leading-relaxed flex-1">
              {discovery.ai_suggestion ? (discovery.ai_suggestion.length > 150 ? discovery.ai_suggestion.substring(0, 147) + '...' : discovery.ai_suggestion) : 'No AI analysis available.'}
            </p>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="glass-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-bold">Account Status</p>
            <p className="text-xs text-text-muted">
              {profile.onboarding_completed ? 'Discovery Completed' : 'Pending Discovery'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 ${profile.onboarding_completed ? 'text-success' : 'text-slate-300'}`} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {profile.onboarding_completed ? 'Verified' : 'Incomplete'}
          </span>
        </div>
      </div>
    </div>
  );
}
