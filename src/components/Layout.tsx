import { NavLink } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, AlertTriangle, PieChart, Users, LogOut, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/comptabilite', label: 'Comptabilité', icon: PieChart },
  { to: '/crm', label: 'CRM & Clients', icon: Users },
  { to: '/coffre-fort', label: 'Coffre-Fort', icon: Shield },
  { to: '/parametres', label: 'Paramètres', icon: SettingsIcon },
] as const;

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { compliance, expiringSoon, settings } = useApp();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch { /* ignore */ }
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">VTC Pro Console</h1>
          <p style={{ color: '#94A3B8' }} className="mt-1 text-sm">
            {settings.companyName ? `${settings.companyName} — ` : ''}Gestion complète VTC conforme arrêté août 2025
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {profile?.full_name && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">{profile.full_name}</span>
              <span className="text-slate-500 font-mono text-[10px]">({user?.email})</span>
            </div>
          )}

          {expiringSoon.length > 0 && (
            <NavLink to="/coffre-fort" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/20 transition-all">
              <AlertTriangle className="w-3.5 h-3.5" /> {expiringSoon.length} doc(s) à vérifier
            </NavLink>
          )}

          <NavLink to="/controle" title="Lancer le Mode Contrôle Routier"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all" style={{
            background: compliance.percent === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: compliance.percent === 100 ? '#22c55e' : '#ef4444',
            border: `1px solid ${compliance.percent === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}>
            <ShieldCheck className="w-4 h-4" /> Contrôle {compliance.percent}%
          </NavLink>

          <button onClick={onNewTrip} className="btn-primary py-2.5 px-4 text-xs font-bold">
            <Plus className="w-4 h-4" /> Nouvelle Course
          </button>

          <button onClick={handleLogout} title="Déconnexion"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="flex gap-2 mb-6 flex-wrap">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? 'bg-white/10 border border-white/20 text-white shadow-lg shadow-black/20' : 'hover:bg-white/5 border border-transparent text-white/60 hover:text-white'}`
            }>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-16 pt-6 pb-6 text-center text-xs text-slate-500 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>VTC Pro Console — Conforme réglementation arrêté août 2025</span>
        <span className="font-medium text-slate-400">
          Réalisé par <strong className="text-blue-400 font-semibold">David Chemla</strong>
        </span>
      </footer>
    </div>
  );
}
