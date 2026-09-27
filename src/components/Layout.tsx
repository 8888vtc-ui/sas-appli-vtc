import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, PieChart, Users, LogOut, ShieldCheck,
  Wallet, QrCode, Plane, LayoutGrid, X,
  ChevronRight, Car
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────────────────────────────────────────────
   SF Symbol-style filled icons for tab bar
   ─────────────────────────────────────────────── */
function TabIcon({ icon: Icon, active }: { icon: any; active: boolean }) {
  return (
    <Icon
      style={{
        width: 24,
        height: 24,
        color: active ? '#0a84ff' : '#8e8e93',
        strokeWidth: active ? 2.4 : 1.8,
        transition: 'all 0.2s ease',
      }}
    />
  );
}

/* ───────────────────────────────────────────────
   Tab bar config (Mobile bottom bar)
   ─────────────────────────────────────────────── */
const tabs = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/notes-de-frais', label: 'Frais', icon: Wallet },
  { to: '/crm', label: 'Clients', icon: Users },
  { to: '#menu', label: 'Menu', icon: LayoutGrid },
];

/* ───────────────────────────────────────────────
   All Apps list (Desktop sidebar + Mobile drawer)
   ─────────────────────────────────────────────── */
const menuItems = [
  { to: '/', label: 'Courses & Planning', icon: Calendar, color: '#0a84ff' },
  { to: '/factures', label: 'Facturation Client', icon: Receipt, color: '#30d158' },
  { to: '/notes-de-frais', label: 'Notes de Frais & Carburant', icon: Wallet, color: '#bf5af2' },
  { to: '/crm', label: 'Clients & CRM', icon: Users, color: '#64d2ff' },
  { to: '/comptabilite', label: 'Comptabilité & Bilan', icon: PieChart, color: '#ff9f0a' },
  { to: '/qrcode', label: 'QR Code & Réservations', icon: QrCode, color: '#ffd60a' },
  { to: '/sign', label: 'Pancarte Accueil Aéroport', icon: Plane, color: '#ff9f0a' },
  { to: '/controle', label: 'Mode Contrôle Police / Boers', icon: ShieldCheck, color: '#ff453a' },
  { to: '/coffre-fort', label: 'Coffre-Fort & Conformité', icon: Shield, color: '#5e5ce6' },
  { to: '/parametres', label: 'Réglages & Chauffeurs', icon: SettingsIcon, color: '#8e8e93' },
];

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { settings, trips } = useApp();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await signOut(); } catch { /* */ }
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* ═══════════════════════════════════════════
           DESKTOP SIDEBAR (>= 1024px)
           ═══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#161618] border-r border-white/10 shrink-0 sticky top-0 h-screen overflow-y-auto p-5 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-extrabold text-white truncate">
              {settings.companyName || 'VTC Pro'}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Service Actif
            </div>
          </div>
        </div>

        {/* 🚨 ÉTAPE 4 : BOUTON URGENCE CONTRÔLE POLICE (Desktop) */}
        <div className="pt-4 pb-2">
          <button
            onClick={() => navigate('/controle')}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-r from-red-500/15 via-red-500/10 to-transparent border border-red-500/30 hover:border-red-500/60 text-red-400 font-bold text-xs uppercase tracking-wider transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Contrôle Police / Boers</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-[10px] text-red-300">1-TAP</span>
          </button>
        </div>

        {/* Bouton Nouvelle Course */}
        <div className="py-2">
          <button
            onClick={onNewTrip}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" /> Nouvelle Course
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 space-y-1 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">Applications</div>
          {menuItems.map((item) => {
            const active = isActive(item.to);
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  active
                    ? 'bg-blue-600/20 text-white border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: active ? item.color : `${item.color}22` }}
                >
                  <item.icon className="w-4 h-4" style={{ color: active ? '#fff' : item.color }} />
                </div>
                <span className="truncate flex-1">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            <div className="text-white font-semibold">{trips.length} courses</div>
            <div className="text-[11px] text-slate-500">SAS VTC Système</div>
          </div>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-2.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
           MAIN CONTAINER (Responsive)
           ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-8">
        {/* MOBILE TOP HEADER (< 1024px) */}
        <header className="flex lg:hidden items-center justify-between px-4 py-3.5 border-b border-white/5 sticky top-0 z-40 bg-black/80 backdrop-blur-xl">
          <div className="overflow-hidden">
            <h1 className="text-lg font-extrabold text-white truncate tracking-tight">
              {settings.companyName || 'VTC Pro'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 🚨 ÉTAPE 4 : BOUTON URGENCE CONTRÔLE POLICE (Mobile) */}
            <button
              onClick={() => navigate('/controle')}
              title="Accès d'urgence Contrôle Police / Boers"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Contrôle</span>
            </button>

            {/* Bouton Nouvelle Course Rapide */}
            <button
              onClick={onNewTrip}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 lg:pt-6">
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════════
           MOBILE BOTTOM TAB BAR (iOS Style, < 1024px)
           ═══════════════════════════════════════════ */}
      <nav className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161618]/95 backdrop-blur-2xl border-t border-white/10 pb-[max(env(safe-area-inset-bottom,0px),0px)]">
        <div className="grid grid-cols-5 max-w-md mx-auto py-2">
          {tabs.map(({ to, label, icon }) => {
            const active = to === '#menu' ? false : isActive(to);
            const handleClick = () => {
              if (to === '#menu') setMenuOpen(true);
              else navigate(to);
            };
            return (
              <button
                key={to}
                onClick={handleClick}
                className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95"
              >
                <TabIcon icon={icon} active={active} />
                <span
                  className={`text-[10px] font-semibold tracking-tight ${
                    active ? 'text-blue-500 font-bold' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
           DRAWER MOBILE (Slide-Over Menu)
           ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 bg-[#1c1c1e] border-l border-white/10 flex flex-col p-5 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="text-lg font-bold text-white">Menu des Applications</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Raccourci d'urgence Contrôle */}
              <button
                onClick={() => {
                  navigate('/controle');
                  setMenuOpen(false);
                }}
                className="w-full mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                  <span>Mode Contrôle Police</span>
                </div>
                <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full">Urgence</span>
              </button>

              {/* Menu list */}
              <div className="flex-1 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                      isActive(item.to) ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: item.color }}
                    >
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>

              {/* Déconnexion */}
              <div className="pt-4 border-t border-white/10 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-red-500/15 text-red-400 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
