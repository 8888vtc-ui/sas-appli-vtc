import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Radar, MapPin, Car, DollarSign, Filter,
  CheckCircle2, Clock, Smartphone, Search, RefreshCw, Zap
} from 'lucide-react';
import { showToast } from '../lib/toast';

// Fake Data for simulation
const MOCK_GROUPS = [
  { id: 'g1', name: 'VTC Sous-traitance PACA', members: 452, status: 'active' },
  { id: 'g2', name: 'Monaco / Nice Courses', members: 890, status: 'active' },
  { id: 'g3', name: 'VIP Riviera Transferts', members: 120, status: 'active' },
  { id: 'g4', name: 'Courses 06/83 Urgent', members: 340, status: 'active' },
];

const MOCK_TRIPS = [
  {
    id: 't1',
    originalMessage: "Urgent cherche Van pour ce soir 20h Nice Aéroport -> Cannes Hotel Martinez. Budget 120€, qui est chaud ?",
    parsed: {
      type: 'Van',
      pickup: 'Nice Aéroport (NCE)',
      dropoff: 'Cannes (Hotel Martinez)',
      date: 'Aujourd\'hui',
      time: '20:00',
      price: 120,
      group: 'VTC Sous-traitance PACA'
    },
    status: 'available', // available, accepted
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 mins ago
  },
  {
    id: 't2',
    originalMessage: "Demain 10h départ St Tropez vers Nice Aéroport, client VIP, Berline ou Classe S uniquement. 250€.",
    parsed: {
      type: 'Berline',
      pickup: 'St Tropez',
      dropoff: 'Nice Aéroport (NCE)',
      date: 'Demain',
      time: '10:00',
      price: 250,
      group: 'VIP Riviera Transferts'
    },
    status: 'available',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 't3',
    originalMessage: "St Raphael centre gare vers Golf de St Tropez. Tout de suite. 80€ net. Van ou Berline.",
    parsed: {
      type: 'Van / Berline',
      pickup: 'St Raphaël (Gare)',
      dropoff: 'Golfe de St Tropez',
      date: 'Aujourd\'hui',
      time: 'Immédiat',
      price: 80,
      group: 'Courses 06/83 Urgent'
    },
    status: 'available',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  }
];

export default function WhatsAppRadar() {
  const [isScanning, setIsScanning] = useState(false);
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');

  // Critères de recherche de l'utilisateur
  const [criteria, setCriteria] = useState({
    vehicleType: 'all', // all, berline, van, basique
    sectors: ['Nice', 'Cannes', 'St Tropez', 'St Raphaël', 'Monaco'],
    minPrice: 50,
    autoScan: true
  });

  const handleScan = () => {
    setIsScanning(true);
    // Simulate AI reading WhatsApp messages
    setTimeout(() => {
      setIsScanning(false);
      showToast('3 nouvelles courses détectées par l\'IA !', 'success');
    }, 2500);
  };

  const handleAcceptTrip = (id: string) => {
    setTrips(trips.map(t => t.id === id ? { ...t, status: 'accepted' } : t));
    showToast('Course acceptée ! Redirection WhatsApp...', 'success');
    // Dans la réalité, cela ouvrirait une URL WhatsApp : `https://wa.me/...?text=Je prends la course`
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            Radar WhatsApp IA
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            L'IA lit vos groupes de sous-traitance et filtre les courses selon vos critères.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1.5 bg-[#161618]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-inner inline-flex">
        <button
          onClick={() => setActiveTab('feed')}
          className={`py-2 px-6 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'feed' ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radar className="w-4 h-4" /> Flux des Courses
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-6 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Filter className="w-4 h-4" /> Critères IA
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Status Bar */}
            <div className="glass rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isScanning ? 'bg-green-500/20' : 'bg-white/10'}`}>
                    <Radar className={`w-6 h-6 ${isScanning ? 'text-green-400 animate-spin' : 'text-slate-400'}`} />
                  </div>
                  {criteria.autoScan && !isScanning && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1c1c1e]" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    Analyse en temps réel
                    {criteria.autoScan && <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] uppercase font-black tracking-wider">Actif</span>}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">L'IA surveille {MOCK_GROUPS.length} groupes de sous-traitance.</p>
                </div>
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Forcer l'analyse
              </button>
            </div>

            {/* FEED */}
            <div className="space-y-4">
              {trips.map(trip => (
                <div key={trip.id} className="glass rounded-2xl p-5 border border-white/5 hover:border-green-500/30 transition-all relative overflow-hidden group">
                  {trip.status === 'accepted' && (
                    <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <div className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2 shadow-2xl shadow-green-900/50">
                        <CheckCircle2 className="w-6 h-6" /> Course Acceptée
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      {/* En-tête de la course */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded bg-white/5 text-slate-300 text-xs font-mono border border-white/10 flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-green-400" /> {trip.parsed.group}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(trip.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Message Original (flouté/discret) */}
                      <p className="text-sm text-slate-400 italic border-l-2 border-white/10 pl-3 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">
                        "{trip.originalMessage}"
                      </p>

                      {/* IA Parsed Data */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 rounded-xl p-4 border border-white/5">
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Départ</p>
                          <p className="text-sm font-bold text-white truncate">{trip.parsed.pickup}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-red-400" /> Arrivée</p>
                          <p className="text-sm font-bold text-white truncate">{trip.parsed.dropoff}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Date & Heure</p>
                          <p className="text-sm font-bold text-white truncate">{trip.parsed.date} à {trip.parsed.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Car className="w-3 h-3 text-blue-400" /> Véhicule</p>
                          <p className="text-sm font-bold text-white truncate">{trip.parsed.type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Prix et Action */}
                    <div className="flex flex-col justify-between items-end shrink-0 sm:w-48">
                      <div className="text-right w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">Tarif Net Sous-traitant</p>
                        <p className="text-3xl font-black text-white flex items-center justify-end gap-1">
                          {trip.parsed.price} <DollarSign className="w-6 h-6 text-green-400" />
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleAcceptTrip(trip.id)}
                        className="w-full mt-3 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-white" /> Accepter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" /> Critères de Recherche IA
              </h2>
              
              <div className="space-y-6">
                {/* Type de Véhicule */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Type de Véhicule recherché</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['all', 'berline', 'van', 'basique'].map(type => (
                      <button
                        key={type}
                        onClick={() => setCriteria({ ...criteria, vehicleType: type })}
                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                          criteria.vehicleType === type ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {type === 'all' ? 'Peu importe' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secteurs */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center justify-between">
                    <span>Secteurs géographiques (Départ ou Arrivée)</span>
                    <span className="text-xs text-slate-500 font-normal">Séparez par des virgules</span>
                  </label>
                  <input
                    type="text"
                    value={criteria.sectors.join(', ')}
                    onChange={(e) => setCriteria({ ...criteria, sectors: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none text-white text-sm"
                    placeholder="Nice, Cannes, Monaco, St Tropez..."
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {criteria.sectors.filter(Boolean).map(sector => (
                      <span key={sector} className="px-3 py-1.5 rounded-full bg-white/10 text-slate-300 text-xs border border-white/10 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-blue-400" /> {sector}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prix Minimum */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Prix net minimum (€)</label>
                  <input
                    type="number"
                    value={criteria.minPrice}
                    onChange={(e) => setCriteria({ ...criteria, minPrice: Number(e.target.value) })}
                    className="w-full sm:w-1/3 bg-white/5 border border-white/10 rounded-xl p-4 outline-none text-white text-sm font-bold text-lg"
                  />
                  <p className="text-xs text-slate-500 mt-2">L'IA ignorera toutes les courses dont le prix est inférieur à ce montant.</p>
                </div>

                {/* Auto Scan Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-sm font-bold text-white">Recherche Automatique Active</div>
                    <div className="text-xs text-slate-400 mt-0.5">L'IA scanne en arrière-plan toutes les 5 minutes</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={criteria.autoScan} onChange={e => setCriteria({ ...criteria, autoScan: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Groups Management (UI Simulation) */}
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-400" /> Groupes Connectés
                </h2>
                <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all">
                  + Lier un nouveau groupe
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {MOCK_GROUPS.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{g.name}</div>
                        <div className="text-xs text-slate-500">{g.members} membres</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
