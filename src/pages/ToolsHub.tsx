import { useNavigate } from 'react-router-dom';
import { 
  Users, Shield, Settings as SettingsIcon, 
  QrCode, Plane, Wrench, ChevronRight 
} from 'lucide-react';

export default function ToolsHub() {
  const navigate = useNavigate();

  const tools = [
    { to: '/crm', label: 'Base Clients (CRM)', icon: Users, color: '#64d2ff', description: 'Gérez vos clients et historiques' },
    { to: '/qrcode', label: 'Générateur QR Code', icon: QrCode, color: '#ffd60a', description: 'Créer des QR pour réservations rapides' },
    { to: '/sign', label: 'Pancarte Aéroport', icon: Plane, color: '#ff9f0a', description: 'Mode plein écran pour accueil' },
    { to: '/coffre-fort', label: 'Dossier Entreprise', icon: Shield, color: '#5e5ce6', description: 'Kbis, URSSAF, Attestations' },
    { to: '/parametres', label: 'Réglages', icon: SettingsIcon, color: '#8e8e93', description: 'Profil, Chauffeurs, Véhicules' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-indigo-400" />
            Boîte à Outils
          </h1>
          <p className="text-slate-400 mt-1">Accédez à tous vos outils professionnels en un clic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.to}
            onClick={() => navigate(tool.to)}
            className="flex items-center gap-4 p-4 bg-[#1c1c1e] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all text-left group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: `${tool.color}22` }}
            >
              <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-base">{tool.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{tool.description}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
