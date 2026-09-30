import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Clock, Check, LocateFixed } from 'lucide-react';
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
  const { addTrip, trips } = useApp();
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
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
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.clientName) newErrors.clientName = true;
    if (!formData.clientPhone) newErrors.clientPhone = true;
    if (!formData.pickUpLocation) newErrors.pickUpLocation = true;
    if (formData.tripType === 'transfer' && !formData.dropOffLocation) newErrors.dropOffLocation = true;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    addTrip(formData);
    setFormData({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setShowClientSuggestions(false);
    setErrors({});
    onClose();
  };



  const handleContactImport = async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const contacts = await (navigator as any).contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          setFormData(prev => ({
            ...prev,
            clientName: contacts[0].name ? contacts[0].name[0] : prev.clientName,
            clientPhone: contacts[0].tel ? contacts[0].tel[0] : prev.clientPhone,
          }));
        }
      } catch (ex) {
        alert("L'importation de contacts n'est pas supportée ou a été annulée.");
      }
    } else {
      alert("Votre navigateur ne supporte pas l'accès direct aux contacts.");
    }
  };

  const handleCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setFormData(prev => ({ ...prev, pickUpLocation: '📍 Position Actuelle (GPS)' }));
      });
    }
  };

  const setMadDuration = (duration: string) => {
    setFormData(prev => ({ ...prev, disposalZone: duration }));
  };

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
            className="w-full sm:max-w-2xl bg-slate-900 border border-slate-700 p-4 sm:p-7 rounded-t-3xl sm:rounded-3xl overflow-y-auto h-[92dvh] sm:h-auto sm:max-h-[90vh] text-white shadow-2xl pb-[calc(env(safe-area-inset-bottom,0px)+96px)]"
          >
            {/* Header / Type de Prestation (MAD vs Transfert) */}
            <div className="sticky top-0 bg-slate-900 z-50 pt-2 pb-4 border-b border-slate-700 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white">Nouvelle Course</h2>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white active:scale-90 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tripType: 'transfer' })}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    formData.tripType === 'transfer'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Transfert (A ➔ B)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tripType: 'disposal' })}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    formData.tripType === 'disposal'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mise à disposition
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: CLIENT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" /> Client
                  </span>
                  <button type="button" onClick={handleContactImport} className="text-xs bg-blue-500/20 text-blue-400 font-bold px-3 py-1.5 rounded-lg active:scale-95">
                    Importer Contacts
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative z-50">
                    <input type="text" placeholder="Nom du client" value={formData.clientName} onChange={(e) => { setFormData({ ...formData, clientName: e.target.value }); handleClientNameChange(e.target.value); }}
                      onFocus={() => { if (knownClients.length > 0) { setClientSuggestions(knownClients.slice(0, 10)); setShowClientSuggestions(true); } }}
                      className={`w-full h-14 bg-slate-900 border-2 ${errors.clientName ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-xl px-4 text-lg font-bold text-white placeholder-slate-400 outline-none`}
                    />
                    
                    <AnimatePresence>
                      {showClientSuggestions && clientSuggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-800 border border-blue-500/40 rounded-xl overflow-hidden shadow-2xl">
                          {clientSuggestions.map((c) => (
                            <button key={c.id} type="button" onClick={() => selectClient(c)}
                              className="w-full text-left p-4 hover:bg-slate-700 border-b border-slate-700 last:border-none flex justify-between items-center active:bg-blue-600/50">
                              <div className="font-bold text-white text-base">{c.name}</div>
                              <div className="text-emerald-400 font-mono text-sm">{c.phone}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <input type="tel" placeholder="Téléphone" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className={`w-full h-14 bg-slate-900 border-2 ${errors.clientPhone ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-xl px-4 text-lg font-bold text-white placeholder-slate-400 outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LIEUX / MAD */}
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" /> {formData.tripType === 'transfer' ? 'Itinéraire' : 'Prise en charge & Durée'}
                </span>

                <div className="space-y-3">
                  <div className="relative z-40">
                    <input type="text" placeholder="Lieu de Départ" value={formData.pickUpLocation} onChange={(e) => handlePickupChange(e.target.value)}
                      className={`w-full h-14 bg-slate-900 border-2 ${errors.pickUpLocation ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'} rounded-xl px-4 text-lg font-bold text-white placeholder-slate-400 outline-none pr-14`}
                    />
                    <button type="button" onClick={handleCurrentPosition} title="Ma position" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-emerald-400 active:scale-95 transition-all">
                      <LocateFixed className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    
                    {pickupSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-800 border-2 border-emerald-500/50 rounded-xl overflow-hidden shadow-2xl">
                        {pickupSuggestions.map((s, idx) => (
                          <button key={idx} type="button" onClick={() => { setFormData({ ...formData, pickUpLocation: s.label }); setPickupSuggestions([]); }}
                            className="w-full text-left p-4 hover:bg-slate-700 border-b border-slate-700 last:border-none flex items-center gap-3 active:bg-emerald-600/50">
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

                  {formData.tripType === 'transfer' ? (
                    <div className="relative z-30">
                      <input type="text" placeholder="Destination" value={formData.dropOffLocation} onChange={(e) => handleDropoffChange(e.target.value)}
                        className={`w-full h-14 bg-slate-900 border-2 ${errors.dropOffLocation ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'} rounded-xl px-4 text-lg font-bold text-white placeholder-slate-400 outline-none`}
                      />
                      
                      {dropoffSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-800 border-2 border-emerald-500/50 rounded-xl overflow-hidden shadow-2xl">
                          {dropoffSuggestions.map((s, idx) => (
                            <button key={idx} type="button" onClick={() => { setFormData({ ...formData, dropOffLocation: s.label }); setDropoffSuggestions([]); }}
                              className="w-full text-left p-4 hover:bg-slate-700 border-b border-slate-700 last:border-none flex items-center gap-3 active:bg-emerald-600/50">
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
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['2h', '4h', 'Demi-journée', 'Journée'].map(dur => (
                        <button key={dur} type="button" onClick={() => setMadDuration(dur)}
                          className={`h-14 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 ${
                            formData.disposalZone === dur ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}>
                          {dur}
                        </button>
                      ))}
                      <input type="text" placeholder="Autre durée..." value={!['2h','4h','Demi-journée','Journée'].includes(formData.disposalZone) ? formData.disposalZone : ''}
                        onChange={(e) => setMadDuration(e.target.value)}
                        className="col-span-2 sm:col-span-4 h-14 bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 text-lg font-bold text-white placeholder-slate-400 outline-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: DATE & HEURE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> Horaires
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => applyTimePreset(15)} className="px-3 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm active:scale-95 border border-amber-500/30">+15m</button>
                    <button type="button" onClick={() => applyTimePreset(30)} className="px-3 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm active:scale-95 border border-amber-500/30">+30m</button>
                    <button type="button" onClick={() => applyTimePreset(60)} className="px-3 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm active:scale-95 border border-amber-500/30">+1h</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-14 bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 text-lg font-bold text-white outline-none" />
                  <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full h-14 bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 text-lg font-bold text-white outline-none" />
                </div>
              </div>

              {/* SECTION 4: PRIX */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    Tarif convenu
                  </label>
                  {formData.tripType === 'disposal' && (
                    <div className="flex gap-2 text-xs font-bold">
                      <label className="flex items-center gap-1"><input type="radio" name="madPrice" defaultChecked className="accent-amber-500" /> Forfait global</label>
                      <label className="flex items-center gap-1"><input type="radio" name="madPrice" className="accent-amber-500" /> Taux horaire</label>
                    </div>
                  )}
                </div>
                <div className="h-[64px] bg-slate-800 border-2 border-slate-600 rounded-xl relative flex items-center overflow-hidden">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-full bg-transparent text-center text-4xl font-extrabold text-white outline-none pr-8"
                  />
                  <span className="absolute right-4 text-2xl font-bold text-slate-400">€</span>
                </div>
              </div>

              {/* FIXED BOTTOM ACTION */}
              <div className="sticky bottom-0 left-0 right-0 p-4 -mx-4 -mb-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 sm:m-0 sm:pt-4 sm:flex sm:gap-3 z-50 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
                <button type="submit" className={`w-full sm:w-auto sm:flex-1 h-16 rounded-2xl ${formData.tripType === 'transfer' ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.4)]'} text-white font-black text-xl transition-all flex items-center justify-center gap-3 active:scale-95`}>
                  <Check className="w-8 h-8 stroke-[3]" /> {formData.tripType === 'transfer' ? 'ENREGISTRER LA COURSE' : 'ENREGISTRER LA MAD'}
                </button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
