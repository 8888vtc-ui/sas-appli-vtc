import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, AlertTriangle, PieChart, Users, LogOut, ShieldCheck,
  Menu, X, Wallet, QrCode
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/comptabilite', label: 'Compta', icon: PieChart },
  { to: '/notes-de-frais', label: 'Frais', icon: Wallet },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/qrcode', label: 'QR Code', icon: QrCode },
  { to: '/coffre-fort', label: 'Coffre', icon: Shield },
  { to: '/parametres', label: 'Réglages', icon: SettingsIcon },
] as const;

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { compliance, expiringSoon, settings } = useApp();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch { /* ignore */ }
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto">
        {/* ══════════ HEADER ══════════ */}
        <header className="flex items-center justify-between gap-3 mb-4 md:mb-6 animate-fade-in">
          {/* Left: Logo */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold gradient-text truncate">VTC Pro Console</h1>
            <p style={{ color: '#94A3B8' }} className="hidden sm:block mt-1 text-xs sm:text-sm truncate">
              {settings.companyName ? `${settings.companyName} — ` : ''}Gestion complète VTC conforme arrêté août 2025
            </p>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User badge — hidden on small */}
            {profile?.full_name && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">{profile.full_name}</span>
                <span className="text-slate-500 font-mono text-[10px]">({user?.email})</span>
              </div>
            )}

            {/* Expiring docs alert */}
            {expiringSoon.length > 0 && (
              <NavLink to="/coffre-fort" className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] sm:text-xs font-semibold hover:bg-yellow-500/20 transition-all">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{expiringSoon.length} doc(s)</span>
                <span className="sm:hidden">{expiringSoon.length}</span>
              </NavLink>
            )}

            {/* Compliance badge */}
            <NavLink to="/controle" title="Lancer le Mode Contrôle Routier"
              className="flex items-center gap-1 px-2 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all" style={{
              background: compliance.percent === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: compliance.percent === 100 ? '#22c55e' : '#ef4444',
              border: `1px solid ${compliance.percent === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Contrôle</span> {compliance.percent}%
            </NavLink>

            {/* New Trip — compact on mobile */}
            <button onClick={onNewTrip} className="btn-primary py-2 px-3 sm:px-4 text-xs font-bold">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle Course</span>
            </button>

            {/* Logout */}
            <button onClick={handleLogout} title="Déconnexion"
              className="hidden sm:flex p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all">
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile expanded menu (user info + logout) */}
        {mobileMenuOpen && (
          <div className="sm:hidden mb-4 glass rounded-2xl p-4 animate-fade-in space-y-3">
            {profile?.full_name && (
              <div className="flex items-center gap-2 text-sm text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold">{profile.full_name}</span>
                <span className="text-slate-500 text-[10px] font-mono truncate">({user?.email})</span>
              </div>
            )}
            <p style={{ color: '#94A3B8' }} className="text-[11px]">
              {settings.companyName ? `${settings.companyName} — ` : ''}Conforme arrêté août 2025
            </p>
            <button onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        )}

        {/* ══════════ DESKTOP NAV TABS (hidden on mobile) ══════════ */}
        <nav className="hidden md:flex gap-2 mb-6 flex-wrap">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? 'bg-white/10 border border-white/20 text-white shadow-lg shadow-black/20' : 'hover:bg-white/5 border border-transparent text-white/60 hover:text-white'}`
              }>
              <Icon className="w-4 h-4" />{label}
            </NavLink>
          ))}
        </nav>

        {/* ══════════ PAGE CONTENT ══════════ */}
        <main>{children}</main>

        {/* Footer — hidden on mobile (bottom nav takes its place) */}
        <footer className="hidden md:flex mt-16 pt-6 pb-6 text-center text-xs text-slate-500 border-t border-white/5 flex-col sm:flex-row items-center justify-between gap-3">
          <span>VTC Pro Console — Conforme réglementation arrêté août 2025</span>
          <span className="font-medium text-slate-400">
            Réalisé par <strong className="text-blue-400 font-semibold">David Chemla</strong>
          </span>
        </footer>
      </div>

      {/* ══════════ MOBILE BOTTOM TAB BAR ══════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        <div className="flex items-stretch justify-around px-1 py-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl min-w-[48px] transition-all ${
                  isActive
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-500 active:text-white active:bg-white/5'
                }`
              }>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold leading-tight">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
