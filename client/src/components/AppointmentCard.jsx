import { Calendar, Clock, User, CheckCircle2, MoreVertical, ExternalLink } from 'lucide-react';

export default function AppointmentCard({ appointment, onStatusUpdate }) {
  const { id, advisor_name, requirement, appointment_date, appointment_time, status } = appointment;
  
  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    confirmed: 'bg-success/10 text-success border-success/20',
    completed: 'bg-primary/10 text-primary border-primary/20',
    cancelled: 'bg-danger/10 text-danger border-danger/20',
  };

  const isToday = new Date(appointment_date).toDateString() === new Date().toDateString();

  return (
    <div className={`glass-card p-5 relative group overflow-hidden ${isToday ? 'border-primary/40 ring-1 ring-primary/20' : ''}`}>
      {isToday && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
          Today
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-lighter flex items-center justify-center text-primary shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-950 text-base">{advisor_name}</h4>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">{requirement}</p>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-surface-lighter text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-sm text-slate-600">
           <Calendar className="w-4 h-4 text-primary/60" />
           <span className="font-medium">{new Date(appointment_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
           <Clock className="w-4 h-4 text-primary/60" />
           <span className="font-medium">{appointment_time.slice(0, 5)} IST</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusColors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {status}
        </span>
        
        {isToday ? (
           <button className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors">
             Join Session <ExternalLink className="w-3 h-3" />
           </button>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-text-muted bg-surface-lighter px-2 py-1 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> 
            Link Active on Day
          </div>
        )}
      </div>
    </div>
  );
}
