import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Clock, Sparkles, Check } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { useApp } from '../context/AppContext';
import { searchFrenchAddresses } from '../lib/addressService';
import type { AddressFeature } from '../lib/addressService';

interface TripFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  pickUpLocation: string;
  dropOffLocation: string;
  date: string;
  time: string;
  flightNumber: string;
  passengerCount: number;
  price: number;
  tripType: 'transfer' | 'disposal';
  disposalEndDate: string;
  disposalEndTime: string;
  disposalZone: string;
  notes: string;
}

interface KnownClient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

const emptyForm: TripFormData = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  pickUpLocation: '',
  dropOffLocation: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm'),
  flightNumber: '',
  passengerCount: 1,
  price: 0,
  tripType: 'transfer',
  disposalEndDate: '',
  disposalEndTime: '',
  disposalZone: '',
  notes: '',
};

export default function TripModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addTrip, trips, settings } = useApp();
  const [formData, setFormData] = useState<TripFormData>({
    ...emptyForm,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
  });

  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressFeature[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressFeature[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<KnownClient[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  const pickupTimerRef = useRef<any>(null);
  const dropoffTimerRef = useRef<any>(null);

  // Recueillir tous les clients connus (trips + CRM)
  const knownClients = useMemo<KnownClient[]>(() => {
    const map = new Map<string, KnownClient>();
    try {
      const saved = localStorage.getItem('vtc_crm_contacts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            if (c.name) {
              map.set(c.name.toLowerCase(), {
                id: c.id || c.name,
                name: c.name,
                phone: c.phone || '',
                email: c.email || '',
                notes: c.notes || '',
              });
            }
          });
        }
      }
    } catch {
      // Ignorer
    }

    if (trips && trips.length > 0) {
      trips.forEach((t) => {
        if (t.clientName && !map.has(t.clientName.toLowerCase())) {
          map.set(t.clientName.toLowerCase(), {
            id: t.id,
            name: t.clientName,
            phone: t.clientPhone || '',
            email: t.clientEmail || '',
            notes: t.notes || '',
          });
        }
      });
    }

    return Array.from(map.values());
  }, [trips]);

  // Address search debounce for Pickup
  const handlePickupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pickUpLocation: value }));
    clearTimeout(pickupTimerRef.current);
    if (value.trim().length >= 3) {
      pickupTimerRef.current = setTimeout(async () => {
        const results = await searchFrenchAddresses(value);
        setPickupSuggestions(results);
      }, 250);
    } else {
      setPickupSuggestions([]);
    }
  };

  // Address search debounce for Dropoff
  const handleDropoffChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dropOffLocation: value }));
    clearTimeout(dropoffTimerRef.current);
    if (value.trim().length >= 3) {
      dropoffTimerRef.current = setTimeout(async () => {
        const results = await searchFrenchAddresses(value);
        setDropoffSuggestions(results);
      }, 250);
    } else {
      setDropoffSuggestions([]);
    }
  };

  // Client Name change & CRM Autocomplete
  const handleClientNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, clientName: value }));
    if (value.trim().length > 0 && knownClients.length > 0) {
      const q = value.toLowerCase();
      const matches = knownClients.filter((c) => c.name.toLowerCase().includes(q));
      setClientSuggestions(matches);
      setShowClientSuggestions(matches.length > 0);
    } else if (value.trim().length === 0) {
      setClientSuggestions(knownClients.slice(0, 10));
      setShowClientSuggestions(knownClients.length > 0);
    } else {
      setShowClientSuggestions(false);
    }
  };

  const selectClient = (client: KnownClient) => {
    setFormData((prev) => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone || prev.clientPhone,
      clientEmail: client.email || prev.clientEmail,
      notes: client.notes ? `${prev.notes ? prev.notes + ' - ' : ''}Client habituel: ${client.notes}` : prev.notes,
    }));
    setShowClientSuggestions(false);
  };

  const applyTimePreset = (minutesToAdd: number) => {
    const target = addMinutes(new Date(), minutesToAdd);
    setFormData((prev) => ({
      ...prev,
      date: format(target, 'yyyy-MM-dd'),
      time: format(target, 'HH:mm'),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrip(formData);
    setFormData({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });
    onClose();
  };

  const handleClose = () => {
    setFormData({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setShowClientSuggestions(false);
    onClose();
  };

  const quickAddresses = useMemo(() => {
    const addr = (settings?.companyAddress || '').toLowerCase();
    
    if (addr.includes('paris') || addr.includes('750') || addr.includes('751') || addr.includes('92') || addr.includes('93') || addr.includes('94')) {
      return ['Aéroport CDG', 'Aéroport Orly', 'Gare de Lyon', 'Gare du Nord', 'Gare Montparnasse'];
    }
    if (addr.includes('nice') || addr.includes('cannes') || addr.includes('antibes') || addr.includes('monaco') || addr.includes('06')) {
      return ['Aéroport Nice T2', 'Aéroport Nice T1', 'Gare de Cannes', 'Gare de Nice', 'Monaco'];
    }
    if (addr.includes('lyon') || addr.includes('69')) {
      return ['Aéroport St-Exupéry', 'Gare Part-Dieu', 'Gare Perrache'];
    }
    if (addr.includes('marseille') || addr.includes('13')) {
      return ['Aéroport Marignane', 'Gare St-Charles', 'Aix TGV'];
    }
    if (addr.includes('toulouse') || addr.includes('31')) {
      return ['Aéroport Blagnac', 'Gare Matabiau'];
    }
    if (addr.includes('bordeaux') || addr.includes('33')) {
      return ['Aéroport Mérignac', 'Gare Saint-Jean'];
    }
    if (addr.includes('lille') || addr.includes('59')) {
      return ['Aéroport Lesquin', 'Gare Lille Flandres', 'Gare Lille Europe'];
    }
    
    // Par défaut si la région n'est pas détectée ou adresse vide
    return ['Aéroport Principal', 'Gare TGV (Centre)', 'Palais des Congrès'];
  }, [settings?.companyAddress]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 100 }}
            className="w-full sm:max-w-2xl bg-slate-900 border border-slate-700 p-5 sm:p-7 rounded-t-2xl sm:rounded-3xl overflow-y-auto h-[92dvh] sm:h-auto sm:max-h-[90vh] text-white shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+96px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-5 sticky top-0 bg-slate-900 z-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Créer une Course</h2>
                  <p className="text-xs text-slate-400">Saisie simplifiée</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* SECTION 1: CLIENT */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                <span className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" /> 1. Client
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative z-50">
                    <input required type="text" placeholder="Nom du client *" value={formData.clientName} onChange={(e) => handleClientNameChange(e.target.value)}
                      onFocus={() => { if (knownClients.length > 0) { setClientSuggestions(knownClients.slice(0, 10)); setShowClientSuggestions(true); } }}
                      className="w-full bg-slate-900 border border-slate-600 focus:border-blue-500 rounded-xl p-4 text-base font-bold text-white placeholder-slate-400 outline-none" />
                    
                    <AnimatePresence>
                      {showClientSuggestions && clientSuggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-800 border border-blue-500/40 rounded-xl overflow-hidden shadow-2xl">
                          {clientSuggestions.map((c) => (
                            <button key={c.id} type="button" onClick={() => selectClient(c)}
                              className="w-full text-left p-4 hover:bg-blue-600/30 border-b border-slate-700 last:border-none flex justify-between items-center active:bg-blue-600/50">
                              <div className="font-bold text-white text-base">{c.name}</div>
                              <div className="text-emerald-400 font-mono text-sm">{c.phone}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <input required type="tel" placeholder="Téléphone *" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 focus:border-blue-500 rounded-xl p-4 text-base font-bold text-white placeholder-slate-400 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LIEUX */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" /> 2. Itinéraire
                </span>

                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                  {quickAddresses.slice(0,4).map((addr) => (
                    <button key={addr} type="button" onClick={() => setFormData({ ...formData, pickUpLocation: addr })}
                      className="text-sm py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold shrink-0 transition-all active:scale-95 border border-slate-600">
                      📍 {addr}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="relative z-40">
                    <input required type="text" placeholder="Lieu de Départ *" value={formData.pickUpLocation} onChange={(e) => handlePickupChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 focus:border-emerald-500 rounded-xl p-4 text-base font-bold text-white placeholder-slate-400 outline-none" />
                    
                    {pickupSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-800 border-2 border-emerald-500/50 rounded-xl overflow-hidden shadow-2xl">
                        {pickupSuggestions.map((s, idx) => (
                          <button key={idx} type="button" onClick={() => { setFormData({ ...formData, pickUpLocation: s.label }); setPickupSuggestions([]); }}
                            className="w-full text-left p-4 hover:bg-emerald-600/30 border-b border-slate-700 last:border-none flex items-center gap-3 transition-colors active:bg-emerald-600/50">
                            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="text-base font-bold text-white truncate">{s.name}</div>
                              <div className="text-sm text-slate-400 truncate">{s.postcode} {s.city}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative z-30">
                    <input required type="text" placeholder="Destination *" value={formData.dropOffLocation} onChange={(e) => handleDropoffChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 focus:border-emerald-500 rounded-xl p-4 text-base font-bold text-white placeholder-slate-400 outline-none" />
                    
                    {dropoffSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-800 border-2 border-emerald-500/50 rounded-xl overflow-hidden shadow-2xl">
                        {dropoffSuggestions.map((s, idx) => (
                          <button key={idx} type="button" onClick={() => { setFormData({ ...formData, dropOffLocation: s.label }); setDropoffSuggestions([]); }}
                            className="w-full text-left p-4 hover:bg-emerald-600/30 border-b border-slate-700 last:border-none flex items-center gap-3 transition-colors active:bg-emerald-600/50">
                            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="text-base font-bold text-white truncate">{s.name}</div>
                              <div className="text-sm text-slate-400 truncate">{s.postcode} {s.city}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: DATE & HEURE */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" /> 3. Horaires
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => applyTimePreset(15)} className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm active:scale-95 transition-all border border-amber-500/30">
                      +15 min
                    </button>
                    <button type="button" onClick={() => applyTimePreset(30)} className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm active:scale-95 transition-all border border-amber-500/30">
                      +30 min
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 focus:border-amber-500 rounded-xl p-4 text-base font-bold text-white outline-none" />
                  <input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 focus:border-amber-500 rounded-xl p-4 text-base font-bold text-white outline-none" />
                </div>
              </div>

              {/* SECTION 4: PRIX */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                <span className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  4. Tarif TTC (€)
                </span>
                <input required type="number" min={0} step={1} placeholder="0" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-blue-500 focus:border-blue-400 rounded-2xl p-6 text-4xl font-black text-blue-400 text-center outline-none" />
              </div>

              {/* FIXED BOTTOM ACTION */}
              <div className="sticky bottom-0 left-0 right-0 p-4 -mx-4 -mb-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 sm:m-0 sm:pt-4 sm:flex sm:gap-3 z-50 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
                <button type="submit" className="w-full sm:w-auto sm:flex-1 h-[60px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Check className="w-7 h-7 stroke-[3]" /> VALIDER LA COURSE
                </button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
