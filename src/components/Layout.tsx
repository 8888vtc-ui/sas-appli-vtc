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
    <div className="min-h-screen w-full bg-black text-white flex justify-center">
      
      {/* ═══════════════════════════════════════════
           MAIN MOBILE CONTAINER (OS STYLE APP)
           ═══════════════════════════════════════════ */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl bg-black min-h-screen flex flex-col relative pb-[calc(90px+env(safe-area-inset-bottom,0px))] shadow-[0_0_50px_rgba(255,255,255,0.05)] border-x border-white/5 sm:border-x-white/10">
        
        {/* TOP HEADER */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 z-40 bg-black/85 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-white truncate tracking-tight">
                {settings.companyName || 'VTC Pro'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                En service
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* LOGOUT ICON */}
            <button
              onClick={() => {
                if(window.confirm('Se déconnecter ?')) signOut();
              }}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center active:scale-90 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
            {/* URGENCE POLICE ICON */}
            <button
              onClick={() => navigate('/controle')}
              className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-90 transition-all"
            >
              <Shield className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 w-full px-4 pt-5 pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>

        {/* BOUTON FLOTTANT COPILOTE IA */}
        {settings.appMode === 'ai' && (
          <div className="fixed bottom-[110px] right-4 z-[45]">
            <button
              onClick={() => setAiOpen(true)}
              className="w-[52px] h-[52px] rounded-full bg-[#1c1c1e] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-500/30 active:scale-90 transition-all group"
            >
              <Sparkles className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#1c1c1e]" />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
             OS-STYLE BOTTOM TAB BAR (DOCK)
             ═══════════════════════════════════════════ */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto bg-[#1c1c1e] border-t border-white/5 pb-[max(env(safe-area-inset-bottom,0px),16px)] pt-4 px-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between">
            
            <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={Calendar} active={isActive('/')} />
              <span className={`text-xs font-medium ${isActive('/') ? 'text-blue-500' : 'text-slate-500'}`}>Planning</span>
            </button>

            <button onClick={() => navigate('/coffre-fort')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={ShieldCheck} active={isActive('/coffre-fort')} />
              <span className={`text-xs font-medium ${isActive('/coffre-fort') ? 'text-blue-500' : 'text-slate-500'}`}>Documents</span>
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
              <span className={`text-xs font-medium ${isActive('/finances') ? 'text-blue-500' : 'text-slate-500'}`}>Finances</span>
            </button>

            <button onClick={() => navigate('/outils')} className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] active:scale-90 transition-all">
              <TabIcon icon={LayoutGrid} active={isActive('/outils')} />
              <span className={`text-xs font-medium ${isActive('/outils') ? 'text-blue-500' : 'text-slate-500'}`}>Réglages</span>
            </button>

          </div>
        </nav>
      </div>

      {/* IA COPILOT MODAL */}
      <AICopilot isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
