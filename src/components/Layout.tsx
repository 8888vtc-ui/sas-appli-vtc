import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, PieChart, Users, LogOut, ShieldCheck,
  Wallet, QrCode, Plane, LayoutGrid, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// 4 onglets principaux desktop
const desktopTabs = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/notes-de-frais', label: 'Frais', icon: Wallet },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/comptabilite', label: 'Compta', icon: PieChart },
];

// Toutes les apps (tiroir)
const allApps = [
  { to: '/', label: 'Courses', icon: Calendar, color: '#3b82f6' },
  { to: '/factures', label: 'Factures', icon: Receipt, color: '#10b981' },
  { to: '/notes-de-frais', label: 'Notes de Frais', icon: Wallet, color: '#a855f7' },
  { to: '/crm', label: 'CRM Clients', icon: Users, color: '#0ea5e9' },
  { to: '/comptabilite', label: 'Comptabilité', icon: PieChart, color: '#f97316' },
  { to: '/qrcode', label: 'QR Code Pro', icon: QrCode, color: '#eab308' },
  { to: '/sign', label: 'Accueil Aéroport', icon: Plane, color: '#f59e0b' },
  { to: '/controle', label: 'Mode Contrôle', icon: ShieldCheck, color: '#22c55e' },
  { to: '/coffre-fort', label: 'Coffre-Fort', icon: Shield, color: '#6366f1' },
  { to: '/parametres', label: 'Réglages', icon: SettingsIcon, color: '#64748b' },
];

// Barre mobile : 4 + menu
const mobileTabs = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/notes-de-frais', label: 'Frais', icon: Wallet },
  { to: '/crm', label: 'CRM', icon: Users },
];

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { compliance, settings, trips } = useApp();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await signOut(); } catch { /* */ }
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">

        {/* ── HEADER MINIMAL ── */}
        <header className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white truncate">
              {settings.companyName || 'VTC Pro'}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">Console de gestion VTC</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Conformité */}
            <NavLink to="/controle"
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
              style={{
                background: compliance.percent === 100 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: compliance.percent === 100 ? '#22c55e' : '#ef4444',
              }}>
              {compliance.percent}%
            </NavLink>

            {/* + Nouvelle Course */}
            <button onClick={onNewTrip}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 active:scale-95 transition-all">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Course</span>
            </button>

            {/* Menu global */}
            <button onClick={() => setMenuOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-all">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── NAV DESKTOP SIMPLE ── */}
        <nav className="hidden md:flex gap-1 mb-6">
          {desktopTabs.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`
              }>
              <Icon className="w-3.5 h-3.5" />{label}
            </NavLink>
          ))}
          {/* Lien discret "Plus..." */}
          <button onClick={() => setMenuOpen(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 flex items-center gap-1.5 transition-all">
            <LayoutGrid className="w-3.5 h-3.5" /> Plus
          </button>
        </nav>

        {/* ── CONTENU ── */}
        <main>{children}</main>

        {/* ── FOOTER DISCRET ── */}
        <footer className="hidden md:block mt-16 pt-4 text-center text-[11px] text-slate-600 border-t border-white/5">
          {settings.companyName || 'VTC Pro Console'} — Réalisé par David Chemla
        </footer>
      </div>

      {/* ── TIROIR MENU COMPLET (OVERLAY SIMPLE) ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-slate-900 border-l border-white/10 p-5 overflow-y-auto"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)' }}
            >
              {/* Entête tiroir */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-white">Menu</span>
                <button onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Liste des apps */}
              <div className="space-y-1">
                {allApps.map(app => (
                  <button key={app.to}
                    onClick={() => { navigate(app.to); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                      location.pathname === app.to
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${app.color}15` }}>
                      <app.icon className="w-4 h-4" style={{ color: app.color }} />
                    </div>
                    {app.label}
                  </button>
                ))}
              </div>

              {/* Info & Déconnexion */}
              <div className="mt-8 pt-4 border-t border-white/5 space-y-3">
                <p className="text-[11px] text-slate-500">{trips.length} course(s) enregistrée(s)</p>
                <button onClick={handleLogout}
                  className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-all">
                  <LogOut className="w-3.5 h-3.5" /> Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BARRE MOBILE (5 BOUTONS AÉRÉS) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(15, 23, 42, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 6px), 6px)',
        }}>
        <div className="grid grid-cols-5 px-2 py-1">
          {mobileTabs.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className="flex flex-col items-center py-1.5">
              <Icon className={`w-5 h-5 ${location.pathname === to ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className={`text-[9px] mt-0.5 ${location.pathname === to ? 'text-blue-400 font-semibold' : 'text-slate-500'}`}>
                {label}
              </span>
            </NavLink>
          ))}
          <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center py-1.5">
            <LayoutGrid className="w-5 h-5 text-slate-500" />
            <span className="text-[9px] mt-0.5 text-slate-500">Plus</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
