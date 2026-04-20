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
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-light" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-muted">System Linked</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 flex flex-col min-h-0 overflow-y-auto relative z-0">
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
