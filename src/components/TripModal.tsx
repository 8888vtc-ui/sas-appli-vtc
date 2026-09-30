import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Clock, Plane, Sparkles, Check } from 'lucide-react';
import { format, addMinutes, addDays, setHours, setMinutes } from 'date-fns';
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
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<KnownClient[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      setIsSearchingPickup(true);
      pickupTimerRef.current = setTimeout(async () => {
        const results = await searchFrenchAddresses(value);
        setPickupSuggestions(results);
        setIsSearchingPickup(false);
      }, 250);
    } else {
      setPickupSuggestions([]);
      setIsSearchingPickup(false);
    }
  };

  // Address search debounce for Dropoff
  const handleDropoffChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dropOffLocation: value }));
    clearTimeout(dropoffTimerRef.current);
    if (value.trim().length >= 3) {
      setIsSearchingDropoff(true);
      dropoffTimerRef.current = setTimeout(async () => {
        const results = await searchFrenchAddresses(value);
        setDropoffSuggestions(results);
        setIsSearchingDropoff(false);
      }, 250);
    } else {
      setDropoffSuggestions([]);
      setIsSearchingDropoff(false);
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

  // Quick Time Presets
  const applyTimePreset = (minutesToAdd: number) => {
    const target = addMinutes(new Date(), minutesToAdd);
    setFormData((prev) => ({
      ...prev,
      date: format(target, 'yyyy-MM-dd'),
      time: format(target, 'HH:mm'),
    }));
  };

  const applyTomorrowPreset = (hour: number) => {
    const tomorrow = setMinutes(setHours(addDays(new Date(), 1), hour), 0);
    setFormData((prev) => ({
      ...prev,
      date: format(tomorrow, 'yyyy-MM-dd'),
      time: format(tomorrow, 'HH:mm'),
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="w-full sm:max-w-2xl bg-[#1c1c1e] border border-white/10 p-5 sm:p-7 rounded-t-3xl sm:rounded-3xl overflow-y-auto max-h-[95vh] sm:max-h-[90vh] text-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Smart Réservation VTC</h2>
                  <p className="text-xs text-slate-400">Saisie prédictive rapide & liaison CRM</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type de course */}
            <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-2xl border border-white/10">
              {(['transfer', 'disposal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, tripType: t })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    formData.tripType === t
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'transfer' ? '🚗 Transfert Direct (A → B)' : '⏱️ Mise à Disposition (MAD)'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* SECTION 1: HEURE & DATE (EXPRESS) */}
              <div className="p-4 rounded-2xl bg-[#252528] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> 1. Date & Heure
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => applyTimePreset(15)} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm active:scale-95 transition-all">
                      +15m
                    </button>
                    <button type="button" onClick={() => applyTimePreset(30)} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm active:scale-95 transition-all">
                      +30m
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#1c1c1e] border-2 border-white/10 focus:border-amber-500 rounded-xl p-4 text-lg font-black text-white outline-none" />
                  </div>
                  <div>
                    <input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-[#1c1c1e] border-2 border-white/10 focus:border-amber-500 rounded-xl p-4 text-lg font-black text-white outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADRESSES (EXPRESS) */}
              <div className="p-4 rounded-2xl bg-[#252528] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> 2. Lieux
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {quickAddresses.slice(0,4).map((addr) => (
                    <button key={addr} type="button" onClick={() => setFormData({ ...formData, pickUpLocation: addr })}
                      className="text-xs py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold shrink-0 transition-all active:scale-95">
                      📍 {addr}
                    </button>
                  ))}
                </div>

                <div className="relative z-40">
                  <input required type="text" placeholder="Départ (Adresse, Aéroport...)" value={formData.pickUpLocation} onChange={(e) => handlePickupChange(e.target.value)}
                    className="w-full bg-[#1c1c1e] border-2 border-white/10 focus:border-emerald-500 rounded-xl p-4 text-base font-bold text-white placeholder-slate-500 outline-none" />
                  
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#252528] border-2 border-emerald-500/50 rounded-xl overflow-hidden shadow-2xl">
                      {pickupSuggestions.map((s, idx) => (
                        <button key={idx} type="button" onClick={() => { setFormData({ ...formData, pickUpLocation: s.label }); setPickupSuggestions([]); }}
                          className="w-full text-left p-4 hover:bg-emerald-600/30 border-b border-white/10 last:border-none flex items-center gap-3 transition-colors">
                          <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div className="overflow-hidden">
                            <div className="text-base font-black text-white truncate">{s.name}</div>
                            <div className="text-sm text-slate-400 truncate">{s.postcode} {s.city}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.tripType === 'transfer' && (
                  <div className="relative z-30 mt-2">
                    <input type="text" placeholder="Destination (Optionnel)" value={formData.dropOffLocation} onChange={(e) => handleDropoffChange(e.target.value)}
                      className="w-full bg-[#1c1c1e] border-2 border-white/10 focus:border-emerald-500 rounded-xl p-4 text-base font-bold text-white placeholder-slate-500 outline-none" />
                    
                    {dropoffSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#252528] border-2 border-emerald-500/50 rounded-xl overflow-hidden shadow-2xl">
                        {dropoffSuggestions.map((s, idx) => (
                          <button key={idx} type="button" onClick={() => { setFormData({ ...formData, dropOffLocation: s.label }); setDropoffSuggestions([]); }}
                            className="w-full text-left p-4 hover:bg-emerald-600/30 border-b border-white/10 last:border-none flex items-center gap-3 transition-colors">
                            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="text-base font-black text-white truncate">{s.name}</div>
                              <div className="text-sm text-slate-400 truncate">{s.postcode} {s.city}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3: PRIX (CALCULATRICE) */}
              <div className="p-4 rounded-2xl bg-[#252528] border border-white/10 text-center">
                <span className="text-sm font-bold text-white uppercase tracking-wider block mb-3">
                  3. Prix Convenu (€)
                </span>
                <input required type="number" min={0} step={1} placeholder="0" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1c1c1e] border-2 border-blue-500 focus:border-blue-400 rounded-2xl p-6 text-5xl font-black text-blue-400 text-center outline-none" />
              </div>

              {/* SECTION 4: DÉTAILS OPTIONNELS (Nom, N° Vol, MAD) */}
              <div className="pt-2">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-base">
                  {showAdvanced ? 'Masquer les détails optionnels' : 'Détails Optionnels (Client, N° Vol...)'}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-3">
                      
                      {/* Client Name Auto Complete */}
                      <div className="relative z-50">
                        <input type="text" placeholder="Nom du client (Optionnel)" value={formData.clientName} onChange={(e) => handleClientNameChange(e.target.value)}
                          onFocus={() => { if (knownClients.length > 0) { setClientSuggestions(knownClients.slice(0, 10)); setShowClientSuggestions(true); } }}
                          className="w-full bg-[#252528] border border-white/10 focus:border-blue-500 rounded-xl p-4 text-base text-white placeholder-slate-500 outline-none" />
                        
                        <AnimatePresence>
                          {showClientSuggestions && clientSuggestions.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                              className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1c1c1e] border border-blue-500/40 rounded-xl overflow-hidden shadow-2xl">
                              {clientSuggestions.map((c) => (
                                <button key={c.id} type="button" onClick={() => selectClient(c)}
                                  className="w-full text-left p-4 hover:bg-blue-600/30 border-b border-white/10 last:border-none flex justify-between items-center">
                                  <div className="font-bold text-white text-base">{c.name}</div>
                                  <div className="text-emerald-400 font-mono text-sm">{c.phone}</div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input type="tel" placeholder="Téléphone" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          className="w-full bg-[#252528] border border-white/10 focus:border-blue-500 rounded-xl p-4 text-base text-white placeholder-slate-500 outline-none" />
                        <div className="relative">
                          <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                          <input type="text" placeholder="N° Vol" value={formData.flightNumber} onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                            className="w-full bg-[#252528] border border-white/10 focus:border-blue-500 rounded-xl py-4 pl-12 pr-4 text-base text-white placeholder-slate-500 outline-none font-mono font-bold" />
                        </div>
                      </div>

                      <textarea placeholder="Notes (Optionnel)" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#252528] border border-white/10 focus:border-blue-500 rounded-xl p-4 text-base text-white placeholder-slate-500 outline-none h-24 resize-none" />

                      {formData.tripType === 'disposal' && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 grid grid-cols-2 gap-3">
                          <input type="time" placeholder="Fin Heure" value={formData.disposalEndTime} onChange={(e) => setFormData({ ...formData, disposalEndTime: e.target.value })}
                            className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl p-4 text-base text-white outline-none" />
                          <input type="text" placeholder="Zone" value={formData.disposalZone} onChange={(e) => setFormData({ ...formData, disposalZone: e.target.value })}
                            className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl p-4 text-base text-white outline-none" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Boutons d'action géants */}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleClose} className="w-1/3 py-5 rounded-2xl bg-[#252528] hover:bg-[#303030] text-white font-black text-lg transition-all active:scale-95">
                  Annuler
                </button>
                <button type="submit" className="w-2/3 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Check className="w-6 h-6 stroke-[3]" /> VALIDER
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
