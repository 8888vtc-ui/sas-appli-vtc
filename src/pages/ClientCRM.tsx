import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronLeft, Phone, 
  Settings2, Star, Thermometer, Headphones, 
  VolumeX, Coffee, FileText, Edit3, 
  ChevronRight, Building2, UserCircle2,
  Wallet, ShieldCheck, History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';
import { showToast } from '../components/Toast';

const c = {
  surface: '#131313',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#b9cbb9',
  primary: '#f1ffef',
  primaryContainer: '#00ff87',
  onPrimaryContainer: '#007138',
  secondaryContainer: '#0566d9',
  onSecondaryContainer: '#e6ecff',
  tertiaryFixedDim: '#ffb95f',
  outlineVariant: '#3b4b3d',
  red: '#ff453a',
  purple: '#bf5af2',
  secondary: '#adc6ff',
  tertiaryContainer: '#ffd8ad',
  outline: '#849585'
};

export default function ClientCRM() {
  const { trips } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [filterType, setFilterType] = useState('tous'); // tous, reguliers, entreprises

  // Regroupement automatique des clients depuis l'historique
  const clients = useMemo(() => {
    const map = new Map();
    trips.forEach(trip => {
      const key = trip.clientPhone || trip.clientName;
      if (!key) return;
      
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: trip.clientName,
          phone: trip.clientPhone || '',
          email: trip.clientEmail || '',
          totalRevenue: 0,
          trips: [],
          preferences: {
            climate: '21°C Constant',
            music: 'Jazz / Bossa doux',
            atmosphere: 'Discrétion absolue',
            drink: 'Eau tempérée'
          }
        });
      }
      
      const c = map.get(key);
      c.totalRevenue += trip.price || 0;
      c.trips.push(trip);
    });
    
    // Charger les préférences locales
    const savedPrefs = JSON.parse(localStorage.getItem('vtc_crm_prefs_v2') || '{}');
    Array.from(map.values()).forEach(c => {
      if (savedPrefs[c.id]) {
        c.preferences = { ...c.preferences, ...savedPrefs[c.id] };
      }
      // Sort trips to have the most recent first
      c.trips.sort((a: any, b: any) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
    });

    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [trips]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    if (!matchesSearch) return false;
    
    if (filterType === 'reguliers') return c.trips.length > 2;
    if (filterType === 'entreprises') return c.name.toLowerCase().includes('cabinet') || c.name.toLowerCase().includes('société');
    return true;
  });

  const totalCA = clients.reduce((acc, c) => acc + c.totalRevenue, 0);

  const savePreferences = (id: string, prefs: any) => {
    const savedPrefs = JSON.parse(localStorage.getItem('vtc_crm_prefs_v2') || '{}');
    savedPrefs[id] = prefs;
    localStorage.setItem('vtc_crm_prefs_v2', JSON.stringify(savedPrefs));
    showToast('Protocole de bord mis à jour', 'success');
  };

  const handleEditPref = (field: string, label: string) => {
    if (!selectedClient) return;
    const current = selectedClient.preferences[field];
    const val = prompt(`Modifier la préférence : ${label}`, current);
    if (val !== null) {
      const newPrefs = { ...selectedClient.preferences, [field]: val };
      setSelectedClient({ ...selectedClient, preferences: newPrefs });
      savePreferences(selectedClient.id, newPrefs);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 text-[#e5e2e1]" style={{ backgroundColor: c.surface }}>
      <AnimatePresence mode="wait">
        {!selectedClient ? (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            
            {/* ── Internal Title Header ── */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5" style={{ color: c.tertiaryFixedDim, fill: c.tertiaryFixedDim }} />
                  <h2 className="text-[22px] font-bold tracking-tight" style={{ color: c.primary }}>Annuaire Clients VIP</h2>
                </div>
                <span className="text-[11px] font-medium mt-0.5" style={{ color: c.onSurfaceVariant }}>Portefeuille clientèle directe & conciergerie</span>
              </div>
              <span className="px-2 py-1 rounded-full text-[11px] font-medium shadow-sm flex items-center gap-1" style={{ backgroundColor: c.surfaceContainerHigh, color: '#00e478' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: c.primaryContainer }}></span>
                Direct Sync
              </span>
            </div>

            {/* ── KPI Top Banner ── */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="p-4 rounded-xl shadow-lg flex flex-col justify-between" style={{ backgroundColor: c.surfaceContainerLow }}>
                <div className="flex items-center justify-between" style={{ color: c.onSurfaceVariant }}>
                  <span className="text-[11px] font-medium uppercase tracking-wider">Clients Fidèles</span>
                  <ShieldCheck className="w-5 h-5" style={{ color: c.secondary }} />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[32px] sm:text-[40px] font-bold tabular-nums" style={{ color: c.primary, lineHeight: 1 }}>{clients.length}</span>
                </div>
                <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: c.surfaceContainerHigh }}>
                  <div className="h-full rounded-full" style={{ backgroundColor: c.primaryContainer, width: '100%' }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl shadow-lg flex flex-col justify-between" style={{ backgroundColor: c.surfaceContainerLow }}>
                <div className="flex items-center justify-between" style={{ color: c.onSurfaceVariant }}>
                  <span className="text-[11px] font-medium uppercase tracking-wider">Total CA Direct</span>
                  <Wallet className="w-5 h-5" style={{ color: c.tertiaryFixedDim }} />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[22px] sm:text-[28px] font-bold tabular-nums tracking-tight" style={{ color: c.primaryContainer, lineHeight: 1.2 }}>{formatEUR(totalCA)}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium mt-2" style={{ color: c.onSurfaceVariant }}>
                  <span style={{ color: c.primaryContainer }}>↑</span>
                  <span>Moy. {clients.length ? Math.round(totalCA / clients.length) : 0} €/client</span>
                </div>
              </div>
            </div>

            {/* ── Search Bar ── */}
            <div className="relative w-full mt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: c.onSurfaceVariant }}>
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher un client, téléphone..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full min-h-[56px] pl-12 pr-12 rounded-xl text-[15px] font-normal shadow-inner outline-none transition-all"
                style={{ backgroundColor: c.surfaceContainerLow, color: c.primary }}
              />
              <button className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors" style={{ color: c.onSurfaceVariant }}>
                <Settings2 className="w-5 h-5" />
              </button>
            </div>

            {/* ── Quick Filter Pills ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {[
                { id: 'tous', label: 'Tous', count: clients.length },
                { id: 'reguliers', label: 'Réguliers', icon: <History className="w-4 h-4" style={{ color: c.tertiaryFixedDim }}/> },
                { id: 'entreprises', label: 'Entreprises', icon: <Building2 className="w-4 h-4" style={{ color: c.secondary }}/> }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className="px-4 min-h-[44px] rounded-full shrink-0 shadow-sm flex items-center gap-1.5 transition-colors text-[13px] font-medium"
                  style={filterType === f.id 
                    ? { backgroundColor: c.primaryContainer, color: c.onPrimaryContainer }
                    : { backgroundColor: c.surfaceContainerLow, color: c.onSurfaceVariant }
                  }
                >
                  {f.icon && filterType !== f.id && f.icon}
                  <span>{f.label}</span>
                  {f.count !== undefined && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: filterType === f.id ? 'rgba(0,113,56,0.15)' : c.surfaceContainerHigh }}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Client List ── */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[13px] font-medium uppercase tracking-wider" style={{ color: c.onSurfaceVariant }}>Répertoire Clients</span>
              <span className="text-[11px] font-medium" style={{ color: c.secondary }}>Classer par CA</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredClients.map((client, index) => (
                <div 
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="p-4 rounded-xl shadow-md flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-colors"
                  style={{ backgroundColor: c.surfaceContainerLow }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: c.surfaceContainerHigh }}>
                        <UserCircle2 className="w-7 h-7" style={{ color: index === 0 ? c.tertiaryFixedDim : c.secondary }} />
                      </div>
                      {index === 0 && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: c.surfaceContainerLowest }}>
                          <Star className="w-3 h-3" style={{ color: c.tertiaryFixedDim, fill: c.tertiaryFixedDim }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-[16px] font-bold truncate" style={{ color: c.primary }}>{client.name}</h4>
                      <span className="text-[13px] font-normal truncate" style={{ color: c.onSurfaceVariant }}>
                        {client.trips.length} course(s)
                      </span>
                      <span className="text-[11px] font-medium flex items-center gap-1 mt-0.5" style={{ color: c.outline }}>
                        <Phone className="w-3 h-3" /> {client.phone || 'Aucun numéro'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[16px] font-bold tabular-nums" style={{ color: c.primaryContainer }}>{formatEUR(client.totalRevenue)}</span>
                    <span className="text-[11px] font-medium mt-0.5" style={{ color: c.onSurfaceVariant }}>CA Total</span>
                    <ChevronRight className="w-5 h-5 mt-1" style={{ color: c.onSurfaceVariant }} />
                  </div>
                </div>
              ))}

              {filteredClients.length === 0 && (
                <div className="p-8 text-center rounded-xl" style={{ backgroundColor: c.surfaceContainerLow }}>
                  <UserCircle2 className="w-10 h-10 mx-auto mb-3 opacity-50" style={{ color: c.onSurfaceVariant }} />
                  <p className="text-[15px]" style={{ color: c.onSurfaceVariant }}>Aucun client trouvé.</p>
                </div>
              )}
            </div>
          </motion.div>

        ) : (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
            
            {/* Back Button */}
            <button 
              onClick={() => setSelectedClient(null)}
              className="flex items-center gap-2 font-bold h-12 active:scale-95 transition-all w-fit"
              style={{ color: c.onSurfaceVariant }}
            >
              <ChevronLeft className="w-5 h-5" /> <span>Retour</span>
            </button>

            {/* ── FICHE CLIENT EN VEDETTE ── */}
            <div className="rounded-xl shadow-2xl p-4 flex flex-col gap-3 relative overflow-hidden" style={{ backgroundColor: c.surfaceContainer }}>
              {/* Prestige Top Glow Strip */}
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: c.surfaceContainerHigh }}>
                      <UserCircle2 className="w-8 h-8" style={{ color: c.primary }} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: c.surfaceContainerLowest }}>
                      <Star className="w-3.5 h-3.5" style={{ color: c.tertiaryFixedDim, fill: c.tertiaryFixedDim }} />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-[18px] sm:text-[22px] font-bold truncate" style={{ color: c.primary }}>{selectedClient.name}</h3>
                    <span className="text-[11px] font-medium truncate uppercase tracking-wider" style={{ color: c.tertiaryFixedDim }}>Client VIP</span>
                    <a href={`tel:${selectedClient.phone}`} className="text-[13px] font-normal flex items-center gap-1 mt-0.5" style={{ color: c.onSurfaceVariant }}>
                      <Phone className="w-3.5 h-3.5" /> <span>{selectedClient.phone || 'Non renseigné'}</span>
                    </a>
                  </div>
                </div>
                {/* Revenue Callout */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-medium uppercase" style={{ color: c.onSurfaceVariant }}>CA Direct</span>
                  <span className="text-[22px] font-bold tabular-nums tracking-tight" style={{ color: c.primaryContainer }}>{formatEUR(selectedClient.totalRevenue)}</span>
                  <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>{selectedClient.trips.length} course(s)</span>
                </div>
              </div>

              {/* VIP Preference Grid */}
              <div className="mt-2 flex flex-col gap-2 p-3 rounded-lg" style={{ backgroundColor: c.surfaceContainerLowest }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1" style={{ color: c.onSurfaceVariant }}>
                    <Settings2 className="w-4 h-4" style={{ color: c.tertiaryFixedDim }} /> Protocole de Bord & Préférences
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div onClick={() => handleEditPref('climate', 'Climatisation')} className="p-2 rounded-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: c.surfaceContainerHigh }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.surfaceContainer, color: c.secondary }}>
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>Climatisation</span>
                      <span className="text-[13px] font-medium truncate" style={{ color: c.primary }}>{selectedClient.preferences.climate || '-'}</span>
                    </div>
                  </div>

                  <div onClick={() => handleEditPref('music', 'Musique')} className="p-2 rounded-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: c.surfaceContainerHigh }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.surfaceContainer, color: c.tertiaryFixedDim }}>
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>Musique</span>
                      <span className="text-[13px] font-medium truncate" style={{ color: c.primary }}>{selectedClient.preferences.music || '-'}</span>
                    </div>
                  </div>

                  <div onClick={() => handleEditPref('atmosphere', 'Ambiance')} className="p-2 rounded-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: c.surfaceContainerHigh }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.surfaceContainer, color: '#00e478' }}>
                      <VolumeX className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>Ambiance</span>
                      <span className="text-[13px] font-medium truncate" style={{ color: c.primary }}>{selectedClient.preferences.atmosphere || '-'}</span>
                    </div>
                  </div>

                  <div onClick={() => handleEditPref('drink', 'Boisson')} className="p-2 rounded-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: c.surfaceContainerHigh }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.surfaceContainer, color: '#d8e2ff' }}>
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>Boisson</span>
                      <span className="text-[13px] font-medium truncate" style={{ color: c.primary }}>{selectedClient.preferences.drink || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats & Last Trip Micro-strip */}
              {selectedClient.trips.length > 0 && (
                <div className="flex items-center justify-between text-[13px] font-normal px-1 mt-1" style={{ color: c.onSurfaceVariant }}>
                  <div className="flex items-center gap-1.5 truncate">
                    <History className="w-4 h-4" style={{ color: c.outline }} />
                    <span className="truncate">
                      Dernier trajet : <strong>{selectedClient.trips[0].date}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Giant Action Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={() => showToast('Facture globale PDF générée et transmise', 'success')}
                  className="w-full min-h-[56px] px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-transform font-bold text-[16px]"
                  style={{ backgroundColor: c.primaryContainer, color: c.onPrimaryContainer }}
                >
                  <FileText className="w-6 h-6" />
                  Générer Relevé Facture
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const note = prompt('Ajouter une note privée :');
                      if (note) showToast('Note privée enregistrée', 'success');
                    }}
                    className="min-h-[56px] px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.99] font-medium text-[13px]"
                    style={{ backgroundColor: c.surfaceContainerHigh, color: c.primary }}
                  >
                    <Edit3 className="w-5 h-5" style={{ color: c.tertiaryFixedDim }} />
                    Note Privée
                  </button>
                  <a 
                    href={`tel:${selectedClient.phone}`}
                    className="min-h-[56px] px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.99] font-medium text-[13px]"
                    style={{ backgroundColor: c.surfaceContainerHigh, color: c.primary }}
                  >
                    <Phone className="w-5 h-5" style={{ color: c.secondary }} />
                    Appeler
                  </a>
                </div>
              </div>
            </div>

            {/* Historique Detail */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[13px] font-medium uppercase tracking-wider" style={{ color: c.onSurfaceVariant }}>Historique détaillé</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {selectedClient.trips.map((trip: any) => (
                <div key={trip.id} className="p-3 rounded-xl shadow-inner border border-transparent" style={{ backgroundColor: c.surfaceContainerLow }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: c.onSurfaceVariant }}>
                      <History className="w-4 h-4" /> {trip.date} à {trip.time}
                    </div>
                    <div className="font-bold" style={{ color: c.primaryContainer }}>{formatEUR(trip.price)}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-start gap-2 text-[13px]" style={{ color: c.primary }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: c.primaryContainer }}></div>
                      <span>{trip.pickUpLocation}</span>
                    </div>
                    {trip.dropOffLocation && (
                      <div className="flex items-start gap-2 text-[13px]" style={{ color: c.primary }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: c.secondaryContainer }}></div>
                        <span>{trip.dropOffLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
