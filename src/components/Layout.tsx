import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Wallet, LayoutGrid,
  Plus, Shield, Sparkles, LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import AICopilot from './AICopilot';

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { settings } = useApp();
  const {} = useAuth(); // or completely remove if not used
  const location = useLocation();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const [onDuty, setOnDuty] = useState(true);

  useEffect(() => {
    const handleOpen = () => onNewTrip();
    window.addEventListener('open-new-trip', handleOpen);
    return () => window.removeEventListener('open-new-trip', handleOpen);
  }, [onNewTrip]);

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col md:flex-row font-sans">
      
      {/* ═══════════════════════════════════════════
           DESKTOP SIDEBAR
           ═══════════════════════════════════════════ */}
      <nav className="hidden md:flex flex-col w-72 shrink-0 bg-[#0a0a0a] border-r border-white/5 h-screen sticky top-0 p-6 z-50">
        <h1 className="text-3xl font-black text-white tracking-tight mb-8">
          {settings.companyName || 'VTC Pro'}
        </h1>
        
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={() => navigate('/')} className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${isActive('/') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Calendar className="w-6 h-6" /> <span className="font-bold text-[17px]">Trajets</span>
          </button>
          <button onClick={() => navigate('/finances')} className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${isActive('/finances') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Wallet className="w-6 h-6" /> <span className="font-bold text-[17px]">Argent</span>
          </button>
          <button onClick={() => navigate('/outils')} className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${isActive('/outils') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutGrid className="w-6 h-6" /> <span className="font-bold text-[17px]">Réglages</span>
          </button>

          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 mt-8 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Se déconnecter
          </button>
        </div>

        <button 
          onClick={onNewTrip} 
          className="w-full py-5 mt-8 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white flex justify-center items-center gap-2 transition-all active:scale-95 text-lg"
        >
          <Plus className="w-6 h-6" /> NOUVEAU TRAJET
        </button>
      </nav>

      {/* ═══════════════════════════════════════════
           MAIN CONTENT AREA
           ═══════════════════════════════════════════ */}
      <div className="flex-1 w-full bg-black min-h-screen flex flex-col relative pb-[calc(90px+env(safe-area-inset-bottom,0px))] md:pb-0">
        
        {/* HEADER & SERVICE TOGGLE */}
        <header className="flex flex-col border-b border-white/10 sticky top-0 z-40 bg-black md:px-10">
          
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-2xl font-black text-white truncate tracking-tight md:hidden">
              {settings.companyName || 'VTC Pro'}
            </h1>
            
            <div className="flex items-center gap-3 ml-auto">
              {settings.appMode === 'ai' && (
                <button
                  onClick={() => setAiOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#1c1c1e] flex items-center justify-center border border-white/10 active:scale-90 transition-all"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </button>
              )}
              <button
                onClick={() => navigate('/controle')}
                className="w-12 h-12 rounded-full bg-[#1c1c1e] text-red-500 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
              >
                <Shield className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* MASSIVE SERVICE TOGGLE */}
          <div className="px-4 pb-4">
            <button 
              onClick={() => setOnDuty(!onDuty)}
              className={`w-full py-4 rounded-2xl font-black text-[18px] transition-all flex items-center justify-center gap-3 ${
                onDuty 
                ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                : 'bg-[#1c1c1e] text-white border border-white/10'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${onDuty ? 'bg-black animate-pulse' : 'bg-red-500'}`} />
              {onDuty ? 'EN SERVICE' : 'EN PAUSE'}
            </button>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-10 pt-5 md:pt-8 pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>

        {/* ═══════════════════════════════════════════
             MOBILE BOTTOM TAB BAR (CHARTE GRAPHIQUE)
             ═══════════════════════════════════════════ */}
        <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onClick={onNewTrip}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-on-primary-container shadow-[0_0_24px_rgba(0,255,135,0.5)] active:scale-95 hover:brightness-110 transition-transform"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

        <nav className="md:hidden fixed bottom-0 w-full z-40 pb-[env(safe-area-inset-bottom,0px)] bg-surface/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between h-20 px-4 max-w-lg mx-auto">
            <div className="flex items-center w-5/12 justify-around">
              <button onClick={() => navigate('/')} className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] transition-colors ${isActive('/') ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
                <Calendar className="w-7 h-7" />
                <span className="text-[11px] font-medium mt-1">Cockpit</span>
              </button>
              <button onClick={() => navigate('/crm')} className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] transition-colors ${isActive('/crm') ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
                <Wallet className="w-7 h-7" />
                <span className="text-[11px] font-medium mt-1">Clients</span>
              </button>
            </div>
            
            <div className="w-2/12 h-full flex items-end justify-center pb-2">
              <span className="text-[11px] font-medium text-on-surface-variant opacity-70">Course</span>
            </div>
            
            <div className="flex items-center w-5/12 justify-around">
              <button onClick={() => navigate('/finances')} className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] transition-colors ${isActive('/finances') ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
                <Sparkles className="w-7 h-7" />
                <span className="text-[11px] font-medium mt-1">Finances</span>
              </button>
              <button onClick={() => navigate('/outils')} className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] transition-colors ${isActive('/outils') ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
                <LayoutGrid className="w-7 h-7" />
                <span className="text-[11px] font-medium mt-1">Réglages</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* IA COPILOT MODAL */}
      <AICopilot isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
