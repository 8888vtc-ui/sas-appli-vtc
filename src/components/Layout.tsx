import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, ShieldCheck, Wallet, LayoutGrid,
  Car, Plus, Shield, Sparkles, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import AICopilot from './AICopilot';

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

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { settings } = useApp();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col md:flex-row font-sans">
      
      {/* ═══════════════════════════════════════════
           DESKTOP SIDEBAR (Cachée sur mobile)
           ═══════════════════════════════════════════ */}
      <nav className="hidden md:flex flex-col w-72 shrink-0 bg-[#111111] border-r border-white/5 h-screen sticky top-0 p-6 shadow-2xl">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-12 text-left cursor-pointer hover:opacity-80 transition-opacity">
          <div className="overflow-hidden">
            <h1 className="text-xl font-extrabold text-white truncate tracking-tight">
              {settings.companyName || 'VTC Pro'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              En service
            </div>
          </div>
        </button>
        
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={() => navigate('/')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive('/') ? 'bg-blue-600/15 text-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Calendar className="w-5 h-5" /> <span className="font-semibold text-[15px]">Planning & Courses</span>
          </button>
          <button onClick={() => navigate('/coffre-fort')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive('/coffre-fort') ? 'bg-blue-600/15 text-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <ShieldCheck className="w-5 h-5" /> <span className="font-semibold text-[15px]">Documents & Bord</span>
          </button>
          <button onClick={() => navigate('/finances')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive('/finances') ? 'bg-blue-600/15 text-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Wallet className="w-5 h-5" /> <span className="font-semibold text-[15px]">Finances & Factures</span>
          </button>
          <button onClick={() => navigate('/outils')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive('/outils') ? 'bg-blue-600/15 text-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutGrid className="w-5 h-5" /> <span className="font-semibold text-[15px]">Réglages & Société</span>
          </button>
        </div>

        <button 
          onClick={onNewTrip} 
          className="w-full py-4 mt-8 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> NOUVELLE COURSE
        </button>
      </nav>

      {/* ═══════════════════════════════════════════
           MAIN CONTENT AREA
           ═══════════════════════════════════════════ */}
      <div className="flex-1 w-full bg-black min-h-screen flex flex-col relative pb-[calc(90px+env(safe-area-inset-bottom,0px))] md:pb-0 md:bg-[#0a0a0a]">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 z-40 bg-black/85 md:bg-[#0a0a0a]/85 backdrop-blur-xl md:px-10 md:py-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 md:hidden text-left cursor-pointer hover:opacity-80 transition-opacity">
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-white truncate tracking-tight">
                {settings.companyName || 'VTC Pro'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                En service
              </div>
            </div>
          </button>
          
          <div className="hidden md:flex flex-col">
             <h2 className="text-2xl font-black text-white tracking-tight">Tableau de bord VTC</h2>
             <span className="text-slate-400 text-sm">Gérez vos courses et votre flotte en temps réel</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* LOGOUT ICON */}
            <button
              onClick={() => {
                if(window.confirm('Se déconnecter ?')) signOut();
              }}
              title="Se déconnecter"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {/* URGENCE POLICE ICON */}
            <button
              onClick={() => navigate('/controle')}
              title="Contrôle Routier"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-90 transition-all hover:bg-red-500/20"
            >
              <Shield className="w-5 h-5 md:w-5 md:h-5 animate-pulse" />
            </button>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-10 pt-5 md:pt-8 pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>

        {/* BOUTON FLOTTANT COPILOTE IA */}
        {settings.appMode === 'ai' && (
          <div className="fixed bottom-[110px] md:bottom-8 right-4 md:right-8 z-[45]">
            <button
              onClick={() => setAiOpen(true)}
              className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-full bg-[#1c1c1e] md:bg-[#111] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500/40 active:scale-90 transition-all group hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
            >
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-400 group-hover:text-purple-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#1c1c1e]" />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
             MOBILE BOTTOM TAB BAR (DOCK)
             ═══════════════════════════════════════════ */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto bg-[#1c1c1e] border-t border-white/5 pb-[max(env(safe-area-inset-bottom,0px),16px)] pt-4 px-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between">
            
            <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={Calendar} active={isActive('/')} />
              <span className={`text-[10px] font-bold ${isActive('/') ? 'text-blue-500' : 'text-slate-500'}`}>Planning</span>
            </button>

            <button onClick={() => navigate('/coffre-fort')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={ShieldCheck} active={isActive('/coffre-fort')} />
              <span className={`text-[10px] font-bold ${isActive('/coffre-fort') ? 'text-blue-500' : 'text-slate-500'}`}>Bord</span>
            </button>

            {/* BIG CENTER FAB FOR NEW TRIP */}
            <div className="relative -top-8 px-2">
              <button
                onClick={onNewTrip}
                className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-[#1c1c1e] active:scale-95 transition-all"
              >
                <Plus className="w-8 h-8 text-white stroke-[3]" />
              </button>
            </div>

            <button onClick={() => navigate('/finances')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={Wallet} active={isActive('/finances')} />
              <span className={`text-[10px] font-bold ${isActive('/finances') ? 'text-blue-500' : 'text-slate-500'}`}>Finances</span>
            </button>

            <button onClick={() => navigate('/outils')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={LayoutGrid} active={isActive('/outils')} />
              <span className={`text-[10px] font-bold ${isActive('/outils') ? 'text-blue-500' : 'text-slate-500'}`}>Réglages</span>
            </button>

          </div>
        </nav>
      </div>

      {/* IA COPILOT MODAL */}
      <AICopilot isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
