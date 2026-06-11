import { NavLink } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, AlertTriangle, PieChart
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/comptabilite', label: 'Comptabilité', icon: PieChart },
  { to: '/coffre-fort', label: 'Coffre-Fort', icon: Shield },
  { to: '/parametres', label: 'Paramètres', icon: SettingsIcon },
] as const;

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { compliance, expiringSoon, settings } = useApp();

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">VTC Pro Console</h1>
          <p style={{ color: '#94A3B8' }} className="mt-1 text-sm">
            {settings.companyName ? `${settings.companyName} — ` : ''}Gestion complète VTC
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {expiringSoon.length > 0 && (
            <NavLink to="/coffre-fort" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/20 transition-all">
              <AlertTriangle className="w-4 h-4" /> {expiringSoon.length} doc(s) à vérifier
            </NavLink>
          )}
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm" style={{
            background: compliance.percent === 100 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: compliance.percent === 100 ? '#22c55e' : '#ef4444',
            border: `1px solid ${compliance.percent === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}>
            <Shield className="w-4 h-4" /> {compliance.percent}%
          </div>
          <button onClick={onNewTrip} className="btn-primary">
            <Plus className="w-5 h-5" /> Nouvelle Course
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="flex gap-2 mb-6 flex-wrap">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${isActive ? 'bg-white/10 border border-white/20 text-white' : 'hover:bg-white/5 border border-transparent text-white/60'}`
            }>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
