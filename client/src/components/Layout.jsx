import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PieChart, TrendingUp, Calculator, Wallet, Target, ShieldAlert, LogOut, Menu, Building, FileText, Users, Bot, Phone, User, Clock, ShieldCheck, Receipt } from 'lucide-react';
import { useState } from 'react';

const individualNav = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/portfolio', icon: PieChart, label: 'Portfolio' },
  { path: '/dashboard/market', icon: TrendingUp, label: 'Market' },
  { path: '/dashboard/calculators', icon: Calculator, label: 'Calculators' },
  { path: '/dashboard/emergency', icon: ShieldCheck, label: 'Emergency Fund' },
  { path: '/dashboard/goals', icon: Target, label: 'Goals' },
  { path: '/dashboard/retirement', icon: Clock, label: 'Retirement Plan' },
  { path: '/dashboard/risk', icon: ShieldAlert, label: 'Risk Analysis' },
  { path: '/dashboard/tax', icon: Receipt, label: 'Tax Management' },
  { path: '/dashboard/contact', icon: Phone, label: 'Contact Advisors' },
  { path: '/dashboard/profile', icon: User, label: 'My Profile' },
];

const businessNav = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Corp Dashboard' },
  { path: '/dashboard/portfolio', icon: PieChart, label: 'Treasury' },
  { path: '/dashboard/emergency', icon: ShieldCheck, label: 'Safety Runway' },
  { path: '/dashboard/goals', icon: Target, label: 'Business Goals' },
  { path: '/dashboard/risk', icon: ShieldAlert, label: 'Risk Audit' },
  { path: '/dashboard/tax', icon: Receipt, label: 'Tax Management' },
  { path: '/dashboard/market', icon: TrendingUp, label: 'Market Intel' },
  { path: '/dashboard/calculators', icon: Calculator, label: 'Calculators' },
  { path: '/dashboard/contact', icon: Phone, label: 'Contact Advisors' },
  { path: '/dashboard/profile', icon: Building, label: 'Company Profile' },
];


export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.user_type === 'business' ? businessNav : individualNav;

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface/95 backdrop-blur-xl border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center ${user?.user_type === 'business' ? 'from-accent to-primary' : 'from-primary to-accent'}`}>
              {user?.user_type === 'business' ? <Building className="w-5 h-5 text-white" /> : <TrendingUp className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="text-lg font-bold glow-text">GrowCap</h1>
              <p className="text-xs text-text-muted">{user?.user_type === 'business' ? 'Fin Manager & Advisor' : 'Personal Wealth Advisor'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
          {/* AI Page Link */}
          <div className="pt-4 mt-4 border-t border-border">
            <NavLink
              to="/dashboard/ai"
              className={({ isActive }) => `sidebar-link ${isActive ? 'bg-primary/20 text-primary-light border border-primary/30' : 'text-primary-light'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Assistant</span>
            </NavLink>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white ${user?.user_type === 'business' ? 'from-accent to-primary' : 'from-primary to-accent'}`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate capitalize">{user?.user_type}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-danger hover:bg-danger/10">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-[#fdfbf7]">
        {/* Premium Geometric & Abstract Background Logic */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Abstract Blobs */}
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-gradient-to-br from-orange-100 to-rose-50 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] bg-gradient-to-tr from-indigo-100/40 to-blue-50/20 rounded-full blur-[100px] opacity-30" />
          <div className="absolute -bottom-[10%] right-[10%] w-[50%] h-[50%] bg-gradient-to-tl from-amber-100 to-orange-50/30 rounded-full blur-[140px] opacity-30 animate-pulse" style={{ animationDuration: '12s' }} />
          
          {/* Subtle Dot Pattern */}
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }} />

          {/* Grainy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/40 via-transparent to-[#fdfbf7]/60" />
        </div>

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#fdfbf7]/80 backdrop-blur-3xl border-b border-border/50 px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-light" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-border shadow-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Security Active</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 flex flex-col min-h-0 overflow-y-auto relative z-10 custom-scrollbar">
          <Outlet />
        </main>

        {/* Corner AI Bot Widget */}
        <button 
          onClick={() => navigate('/dashboard/ai')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-950 text-white shadow-2xl flex items-center justify-center hover:-translate-y-1 hover:shadow-indigo-500/30 transition-all z-50 group hover:w-48 overflow-hidden"
        >
          <div className="flex items-center gap-2 w-full justify-center px-4">
            <Bot className="w-6 h-6 shrink-0" />
            <span className="font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm">Ask AI Bot</span>
          </div>
        </button>
      </div>
    </div>
  );
}
