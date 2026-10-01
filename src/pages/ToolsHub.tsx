import { useNavigate } from 'react-router-dom';
import { 
  Users, Shield, Settings as SettingsIcon, 
  QrCode, Plane, Wrench, ChevronRight, MessageCircle 
} from 'lucide-react';

import { useApp } from '../context/AppContext';

export default function ToolsHub() {
  const navigate = useNavigate();
  const { settings } = useApp();

  const tools = [
    { to: '/clients', label: 'CRM & Fichiers Clients', icon: Users, color: '#64d2ff', description: 'Gérez vos clients et historiques' },
    ...(settings.appMode === 'ai' ? [{ to: '/whatsapp-radar', label: 'Radar WhatsApp IA', icon: MessageCircle, color: '#34c759', description: 'Bourse aux courses & Groupes' }] : []),
    { to: '/qrcode', label: 'Générateur QR Code', icon: QrCode, color: '#ffd60a', description: 'Créer des QR pour réservations rapides' },
    { to: '/sign', label: 'Pancarte Aéroport', icon: Plane, color: '#ff9f0a', description: 'Mode plein écran pour accueil' },
    { to: '/coffre-fort', label: 'Dossier Entreprise', icon: Shield, color: '#5e5ce6', description: 'Kbis, URSSAF, Attestations' },
    { to: '/parametres', label: 'Réglages', icon: SettingsIcon, color: '#8e8e93', description: 'Profil, Chauffeurs, Véhicules' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Wrench className="w-6 h-6 text-indigo-400" />
            </div>
            Boîte à Outils
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">L'écosystème complet pour gérer votre activité.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <button
            key={tool.to}
            onClick={() => navigate(tool.to)}
            className="group relative overflow-hidden flex items-center gap-5 p-5 glass rounded-[24px] text-left"
          >
            {/* Background glow on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ background: `radial-gradient(circle at center, ${tool.color}, transparent 70%)` }}
            />
            
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-white/10 relative z-10 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `linear-gradient(135deg, ${tool.color}22, ${tool.color}11)` }}
            >
              <tool.icon className="w-7 h-7" style={{ color: tool.color }} />
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="font-extrabold text-white text-[15px] transition-colors duration-300">
                {tool.label}
              </div>
              <div className="text-[13px] text-slate-400 mt-1 font-medium">{tool.description}</div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center relative z-10 group-hover:bg-white/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
