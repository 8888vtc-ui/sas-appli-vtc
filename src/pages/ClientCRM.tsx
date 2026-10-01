import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ChevronLeft, MapPin, Calendar, Save, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';
import { showToast } from '../components/Toast';

export default function ClientCRM() {
  const { trips } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Regroupement automatique des clients depuis l'historique des courses
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
            temperature: '',
            radio: '',
            discussion: ''
          }
        });
      }
      
      const c = map.get(key);
      c.totalRevenue += trip.price || 0;
      c.trips.push(trip);
    });
    
    // Charger les préférences locales
    const savedPrefs = JSON.parse(localStorage.getItem('vtc_crm_prefs') || '{}');
    Array.from(map.values()).forEach(c => {
      if (savedPrefs[c.id]) {
        c.preferences = savedPrefs[c.id];
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [trips]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const savePreferences = (id: string, prefs: any) => {
    const savedPrefs = JSON.parse(localStorage.getItem('vtc_crm_prefs') || '{}');
    savedPrefs[id] = prefs;
    localStorage.setItem('vtc_crm_prefs', JSON.stringify(savedPrefs));
    showToast('Préférences sauvegardées', 'success');
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!selectedClient ? (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-white">Annuaire Clients</h1>
              
              <button className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Ajouter manuellement
              </button>

              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un client (nom, tél)..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-14 bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{client.name}</h3>
                      <p className="text-slate-400 text-sm">{client.phone || 'Aucun numéro'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatEUR(client.totalRevenue)}</p>
                    <p className="text-slate-400 text-xs">{client.trips.length} course(s)</p>
                  </div>
                </button>
              ))}
              
              {filteredClients.length === 0 && (
                <div className="p-8 text-center bg-slate-800/50 border border-slate-700 rounded-xl">
                  <User className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-lg">Aucun client trouvé.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-20">
            <button 
              onClick={() => setSelectedClient(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-bold h-14 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Retour à la liste
            </button>
            
            {/* Fiche Detail : En-tête */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center shadow-lg">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 mx-auto flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
              <p className="text-slate-400 text-lg mt-1">{selectedClient.phone || 'Pas de numéro'}</p>
              <div className="inline-block mt-4 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-bold text-lg shadow-inner">
                CA Total : {formatEUR(selectedClient.totalRevenue)}
              </div>
            </div>

            {/* Fiche Detail : Préférences VTC */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-bold text-lg mb-3">Préférences du client</h3>
              
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-slate-400 text-sm font-medium ml-1">Température à bord</label>
                  <input 
                    type="text"
                    placeholder="Ex: 21°C"
                    value={selectedClient.preferences.temperature}
                    onChange={e => setSelectedClient({ ...selectedClient, preferences: { ...selectedClient.preferences, temperature: e.target.value } })}
                    className="w-full h-14 bg-slate-900 border border-slate-600 rounded-xl px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-slate-400 text-sm font-medium ml-1">Musique / Radio</label>
                  <input 
                    type="text"
                    placeholder="Ex: Jazz, FIP, Silence absolu..."
                    value={selectedClient.preferences.radio}
                    onChange={e => setSelectedClient({ ...selectedClient, preferences: { ...selectedClient.preferences, radio: e.target.value } })}
                    className="w-full h-14 bg-slate-900 border border-slate-600 rounded-xl px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 text-sm font-medium ml-1">Discussion</label>
                  <input 
                    type="text"
                    placeholder="Ex: Discret, Parle beaucoup..."
                    value={selectedClient.preferences.discussion}
                    onChange={e => setSelectedClient({ ...selectedClient, preferences: { ...selectedClient.preferences, discussion: e.target.value } })}
                    className="w-full h-14 bg-slate-900 border border-slate-600 rounded-xl px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button 
                  onClick={() => savePreferences(selectedClient.id, selectedClient.preferences)}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-2 shadow-lg shadow-blue-600/30"
                >
                  <Save className="w-5 h-5" /> Sauvegarder les préférences
                </button>
              </div>
            </div>

            {/* Fiche Detail : Historique */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-bold text-lg mb-4">Historique des courses ({selectedClient.trips.length})</h3>
              <div className="flex flex-col gap-4">
                {selectedClient.trips.map((trip: any) => (
                  <div key={trip.id} className="p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-inner">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <Calendar className="w-4 h-4" /> {trip.date} à {trip.time}
                      </div>
                      <div className="font-bold text-emerald-400">{formatEUR(trip.price)}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-3 text-white text-sm">
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{trip.pickUpLocation}</span>
                      </div>
                      {trip.dropOffLocation && (
                        <div className="flex items-start gap-3 text-white text-sm">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span>{trip.dropOffLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
