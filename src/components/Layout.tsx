import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, TrendingUp, LayoutGrid, Users,
  Plus, Shield, Sparkles, LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import AICopilot from './AICopilot';
import DutySwitch from './DutySwitch';

const NAV = [
  { path: '/', label: 'Trajets', mobileLabel: 'Cockpit', icon: Calendar },
  { path: '/crm', label: 'Clients', mobileLabel: 'Clients', icon: Users },
  { path: '/finances', label: "Chiffre d'affaires", mobileLabel: 'Revenus', icon: TrendingUp },
  { path: '/outils', label: 'Réglages', mobileLabel: 'Réglages', icon: LayoutGrid },
] as const;

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  // Statut de service persistant (survit au rechargement de la PWA)
  const [onDuty, setOnDuty] = useState<boolean>(() => localStorage.getItem('vtc_on_duty') !== '0');
  useEffect(() => { localStorage.setItem('vtc_on_duty', onDuty ? '1' : '0'); }, [onDuty]);

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    const handleOpen = () => onNewTrip();
    window.addEventListener('open-new-trip', handleOpen);
    return () => window.removeEventListener('open-new-trip', handleOpen);
  }, [onNewTrip]);

  const companyName = settings.companyName || 'AppVTC';
  const roundBtn = 'w-11 h-11 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center active:scale-90 transition-transform shrink-0';

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col md:flex-row font-sans">

      {/* ═══════════════ DESKTOP SIDEBAR ═══════════════ */}
      <nav className="hidden md:flex flex-col w-72 shrink-0 bg-[#0a0a0a] border-r border-white/5 h-screen sticky top-0 p-6 z-50">
        {/* Profil */}
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="" className="w-11 h-11 rounded-xl border border-[#00ff87]/30 shadow-[0_0_15px_rgba(0,255,135,0.3)]" />
          <div className="min-w-0">
            <p className="text-lg font-black tracking-tight truncate">{companyName}</p>
            <p className="text-xs font-semibold text-[#b4b4b4]">Espace chauffeur</p>
          </div>
        </div>

        {/* Action principale — en haut (lecture en F) */}
        <button
          id="sidebar-new-trip"
          onClick={onNewTrip}
          className="w-full mt-6 min-h-[56px] rounded-2xl bg-[#00ff87] text-[#00391c] font-extrabold text-base flex justify-center items-center gap-2 shadow-[0_0_24px_rgba(0,255,135,0.25)] hover:brightness-110 active:scale-[0.98] transition"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> Nouveau trajet
        </button>

        <div className="flex flex-col gap-1 mt-8 flex-1">
          {NAV.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                id={`sidebar-nav-${item.mobileLabel.toLowerCase()}`}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-4 px-4 min-h-[52px] rounded-xl transition-colors ${active ? 'bg-white/[0.07] text-white' : 'text-[#b4b4b4] hover:bg-white/5 hover:text-white'}`}
              >
                {active && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#00ff87]" />}
                <item.icon className={`w-5 h-5 ${active ? 'text-[#00ff87]' : ''}`} />
                <span className="font-bold text-base">{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          id="sidebar-logout"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 min-h-[48px] text-sm font-semibold text-[#b4b4b4] hover:bg-red-500/10 hover:text-[#ff453a] rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" /> Se déconnecter
        </button>
      </nav>

      {/* ═══════════════ CONTENU ═══════════════ */}
      <div className="flex-1 w-full min-w-0 bg-black min-h-screen flex flex-col relative pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-0">

        {/* Barre supérieure compacte (une seule ligne) */}
        <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-white/[0.06] pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center gap-2 h-16 max-w-6xl mx-auto w-full pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pl-10 md:pr-10">
            <div className="flex items-center gap-2.5 min-w-0 md:hidden">
              <img src="/logo.jpg" alt="" className="w-9 h-9 rounded-lg border border-[#00ff87]/30 shrink-0" />
              <span className="text-lg font-black tracking-tight truncate hidden min-[420px]:block">{companyName}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <DutySwitch on={onDuty} onToggle={() => setOnDuty(v => !v)} />
              {settings.appMode === 'ai' && (
                <button id="header-ai" aria-label="Copilote IA" onClick={() => setAiOpen(true)} className={roundBtn}>
                  <Sparkles className="w-5 h-5 text-white" />
                </button>
              )}
              <button id="header-control" aria-label="Mode contrôle" onClick={() => navigate('/controle')} className={`${roundBtn} text-[#ff453a]`}>
                <Shield className="w-5 h-5" />
              </button>
              <button id="header-logout" aria-label="Se déconnecter" onClick={logout} className={`${roundBtn} text-[#b4b4b4] md:hidden`}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-10 pt-4 md:pt-8 pb-10 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pl-10 md:pr-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>

        {/* ═══════════════ MOBILE : bouton + flottant ═══════════════ */}
        <div className="md:hidden fixed left-1/2 -translate-x-1/2 z-50 bottom-[calc(44px+env(safe-area-inset-bottom,0px))]">
          <button
            id="mobile-new-trip"
            aria-label="Nouveau trajet"
            onClick={onNewTrip}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff87] text-[#00391c] shadow-[0_0_24px_rgba(0,255,135,0.45)] ring-4 ring-black active:scale-95 transition-transform"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

        {/* ═══════════════ MOBILE : barre d'onglets ═══════════════ */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-white/[0.06] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
          <div className="grid grid-cols-5 items-center h-[72px] max-w-lg mx-auto">
            {NAV.slice(0, 2).map(item => <TabButton key={item.path} item={item} active={isActive(item.path)} onClick={() => navigate(item.path)} />)}
            <div className="flex items-end justify-center h-full pb-2">
              <span className="text-xs font-semibold text-[#b4b4b4]">Course</span>
            </div>
            {NAV.slice(2).map(item => <TabButton key={item.path} item={item} active={isActive(item.path)} onClick={() => navigate(item.path)} />)}
          </div>
        </nav>
      </div>

      <AICopilot isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

function TabButton({ item, active, onClick }: { item: typeof NAV[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      id={`tab-${item.mobileLabel.toLowerCase()}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${active ? 'text-[#00ff87]' : 'text-[#b4b4b4]'}`}
    >
      <item.icon className="w-6 h-6" />
      <span className="text-xs font-semibold">{item.mobileLabel}</span>
    </button>
  );
}
