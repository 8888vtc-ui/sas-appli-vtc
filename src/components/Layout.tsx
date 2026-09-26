import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, AlertTriangle, PieChart, Users, LogOut, ShieldCheck,
  X, Wallet, QrCode, Plane, LayoutGrid
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface AppGridItem {
  to: string;
  label: string;
  sub: string;
  icon: any;
  gradient: string;
  shadow: string;
  tag?: string;
}

// Toutes les applications disponibles (Style iPhone / Apple CarPlay)
export const APPS_GRID: AppGridItem[] = [
  {
    to: '/',
    label: 'Courses',
    sub: 'Planning & Trajets',
    icon: Calendar,
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    tag: 'Principal',
  },
  {
    to: '/sign',
    label: 'Aéroport',
    sub: 'Panneau Accueil',
    icon: Plane,
    gradient: 'from-amber-400 to-yellow-600',
    shadow: 'shadow-yellow-500/25',
    tag: 'Live Sign',
  },
  {
    to: '/factures',
    label: 'Factures',
    sub: 'Émises & Encaissées',
    icon: Receipt,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
  },
  {
    to: '/notes-de-frais',
    label: 'Notes de Frais',
    sub: 'Tickets & Barème IK',
    icon: Wallet,
    gradient: 'from-purple-500 to-pink-600',
    shadow: 'shadow-purple-500/25',
    tag: 'URSSAF',
  },
  {
    to: '/crm',
    label: 'Clients CRM',
    sub: 'Contacts & Relances',
    icon: Users,
    gradient: 'from-sky-400 to-blue-600',
    shadow: 'shadow-sky-500/25',
  },
  {
    to: '/comptabilite',
    label: 'Comptabilité',
    sub: 'CA, TVA & Bilan',
    icon: PieChart,
    gradient: 'from-orange-500 to-rose-500',
    shadow: 'shadow-orange-500/25',
  },
  {
    to: '/qrcode',
    label: 'QR Code Pro',
    sub: 'Chevalet & Contact',
    icon: QrCode,
    gradient: 'from-yellow-400 to-amber-500',
    shadow: 'shadow-amber-500/25',
    tag: 'Nouveau',
  },
  {
    to: '/controle',
    label: 'Mode Contrôle',
    sub: 'Police & Boers',
    icon: ShieldCheck,
    gradient: 'from-emerald-600 to-green-700',
    shadow: 'shadow-green-600/25',
    tag: 'Police',
  },
  {
    to: '/coffre-fort',
    label: 'Coffre-Fort',
    sub: 'Documents légaux',
    icon: Shield,
    gradient: 'from-indigo-600 to-slate-800',
    shadow: 'shadow-indigo-500/25',
  },
  {
    to: '/parametres',
    label: 'Réglages',
    sub: 'Société & Véhicule',
    icon: SettingsIcon,
    gradient: 'from-slate-600 to-slate-800',
    shadow: 'shadow-slate-500/25',
  },
];

// Barre du bas optimisée mobile (5 icônes spacieuses avec le pouce)
const mobileBottomTabs = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/sign', label: 'Aéroport', icon: Plane },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/notes-de-frais', label: 'Frais', icon: Wallet },
] as const;

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { compliance, expiringSoon, settings, trips } = useApp();
  const { signOut } = useAuth();
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch { /* ignore */ }
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto">
        {/* ══════════ HEADER ÉPURÉ STYLE APPLE ══════════ */}
        <header className="flex items-center justify-between gap-3 mb-4 md:mb-6 animate-fade-in">
          {/* Logo & Titre */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setAppLauncherOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
              title="Ouvrir le menu des Applications"
            >
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text truncate">
                {settings.companyName || 'VTC Pro Console'}
              </h1>
              <p style={{ color: '#94A3B8' }} className="hidden sm:block text-xs truncate">
                Console Chauffeur VTC • Conforme décret août 2025
              </p>
            </div>
          </div>

          {/* Boutons d'Action Rapides en Haut */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton Alertes Docs */}
            {expiringSoon.length > 0 && (
              <NavLink
                to="/coffre-fort"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold hover:bg-yellow-500/25 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">{expiringSoon.length} doc(s)</span>
                <span className="sm:hidden">{expiringSoon.length}</span>
              </NavLink>
            )}

            {/* Bouton Contrôle Routier Police */}
            <NavLink
              to="/controle"
              title="Lancer le Mode Contrôle Routier Police / Boers"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
              style={{
                background: compliance.percent === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: compliance.percent === 100 ? '#22c55e' : '#ef4444',
                border: `1px solid ${compliance.percent === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Police</span> {compliance.percent}%
            </NavLink>

            {/* Nouvelle Course */}
            <button
              onClick={onNewTrip}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2 px-3 sm:px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle Course</span>
            </button>

            {/* Menu Toutes les Apps (Bouton Dédié) */}
            <button
              onClick={() => setAppLauncherOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
              title="Toutes les Applications"
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Apps</span>
            </button>
          </div>
        </header>

        {/* ══════════ NAVIGATION DESKTOP (Onglets avec grandes icônes visibles) ══════════ */}
        <nav className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {APPS_GRID.map(app => (
            <NavLink
              key={app.to}
              to={app.to}
              end={app.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-white/15 border border-white/30 text-white shadow-lg shadow-black/30'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-sm`}>
                <app.icon className="w-3.5 h-3.5" />
              </div>
              <span>{app.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ══════════ CONTENU DE LA PAGE ══════════ */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="hidden md:flex mt-12 pt-6 pb-6 text-center text-xs text-slate-500 border-t border-white/5 flex-col sm:flex-row items-center justify-between gap-3">
          <span>VTC Pro Console — Décret août 2025</span>
          <span className="font-medium text-slate-400">
            Réalisé par <strong className="text-blue-400 font-semibold">David Chemla</strong>
          </span>
        </footer>
      </div>

      {/* ══════════ MODALE TIROIR STYLE IPHONE LAUNCHER (SPRINGBOARD) ══════════ */}
      <AnimatePresence>
        {appLauncherOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-6">
            {/* Backdrop sombre flouté */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAppLauncherOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Conteneur Grille iOS */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl mx-auto bg-slate-900/95 border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 24px)' }}
            >
              {/* Entête du Launcher */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Centre d'Applications VTC</h2>
                    <p className="text-xs text-slate-400">Touchez une application pour y accéder</p>
                  </div>
                </div>
                <button
                  onClick={() => setAppLauncherOpen(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grille d'icônes géantes style iPhone */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                {APPS_GRID.map(app => (
                  <button
                    key={app.to}
                    onClick={() => {
                      navigate(app.to);
                      setAppLauncherOpen(false);
                    }}
                    className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-white/5 active:scale-95 transition-all"
                  >
                    {/* Icône Squircle Style Apple iOS */}
                    <div
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-[22px] bg-gradient-to-br ${app.gradient} ${app.shadow} shadow-lg flex items-center justify-center text-white mb-2 group-hover:scale-105 group-hover:shadow-2xl transition-all border border-white/20`}
                    >
                      <app.icon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md" />

                      {/* Tag ou Badge sur l'icône */}
                      {app.tag && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                          {app.tag}
                        </span>
                      )}
                    </div>

                    {/* Libellé */}
                    <span className="text-xs font-bold text-white tracking-tight leading-tight line-clamp-1">
                      {app.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                      {app.sub}
                    </span>
                  </button>
                ))}
              </div>

              {/* Raccourcis rapides bas de modal */}
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">
                    {trips.length} course(s) enregistrée(s)
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Déconnexion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ BARRE DU BAS MOBILE ÉPURÉE (5 BOUTONS SPACIEUX) ══════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)',
        }}
      >
        <div className="grid grid-cols-5 items-center px-1 py-1.5 text-center">
          {mobileBottomTabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex flex-col items-center justify-center py-1 rounded-xl transition-all"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  location.pathname === to
                    ? 'bg-blue-500/20 text-blue-400 shadow-sm font-bold'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight ${location.pathname === to ? 'text-blue-400 font-bold' : 'text-slate-400 font-medium'}`}>
                {label}
              </span>
            </NavLink>
          ))}

          {/* 5ème bouton : Lanceur Toutes les Apps Style iPhone */}
          <button
            onClick={() => setAppLauncherOpen(true)}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-amber-400 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight font-bold text-amber-300">Toutes</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
