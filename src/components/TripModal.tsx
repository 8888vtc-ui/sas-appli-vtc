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
  const { addTrip, trips } = useApp();
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
    if (value.trim().length >= 2 && knownClients.length > 0) {
      const q = value.toLowerCase();
      const matches = knownClients.filter((c) => c.name.toLowerCase().includes(q));
      setClientSuggestions(matches);
      setShowClientSuggestions(matches.length > 0);
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

  const quickAddresses = ['Aéroport CDG', 'Aéroport Orly', 'Aéroport Nice T2', 'Gare de Lyon', 'Gare Montparnasse'];

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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* SECTION CLIENT (avec autocomplétion CRM) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> 1. Client & Contact
                  </span>
                  {knownClients.length > 0 && (
                    <span className="text-[11px] text-slate-400">{knownClients.length} clients mémorisés</span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Nom Client avec autocomplétion CRM */}
                  <div className="relative">
                    <label className="text-xs text-slate-400 mb-1 block">Nom & Prénom *</label>
                    <input
                      required
                      type="text"
                      placeholder="Tapez le nom d'un client..."
                      value={formData.clientName}
                      onChange={(e) => handleClientNameChange(e.target.value)}
                      onFocus={() => {
                        if (formData.clientName.trim().length >= 2 && clientSuggestions.length > 0) {
                          setShowClientSuggestions(true);
                        }
                      }}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-blue-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none"
                    />

                    {/* Dropdown Suggestions CRM */}
                    <AnimatePresence>
                      {showClientSuggestions && clientSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#252528] border border-blue-500/40 rounded-xl overflow-hidden shadow-2xl"
                        >
                          <div className="p-2 bg-blue-600/10 text-[11px] font-bold text-blue-400 border-b border-white/10 flex justify-between items-center">
                            <span>Clients reconnus (Cliquez pour auto-remplir)</span>
                            <button
                              type="button"
                              onClick={() => setShowClientSuggestions(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          {clientSuggestions.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => selectClient(c)}
                              className="w-full text-left p-3 hover:bg-blue-600/20 border-b border-white/5 last:border-none flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="font-semibold text-white text-sm">{c.name}</div>
                              </div>
                              <div className="text-right text-xs text-slate-400">
                                {c.phone && <div className="text-emerald-400 font-mono">{c.phone}</div>}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Téléphone Client */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Téléphone Mobile *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-blue-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Email Client (Optionnel)</label>
                    <input
                      type="email"
                      placeholder="client@entreprise.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-blue-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* N° Vol ou Train */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">N° Vol / Train (Pour pancarte)</label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                      <input
                        type="text"
                        placeholder="Ex: AF1234 ou TGV 6120"
                        value={formData.flightNumber}
                        onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                        className="w-full bg-[#2c2c2e] border border-white/10 focus:border-blue-500 rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION ITINÉRAIRE (avec autocomplétion API Adresse) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> 2. Lieux & Guidage GPS
                  </span>
                  <span className="text-[11px] text-slate-400">Autocomplétion nationale</span>
                </div>

                {/* Raccourcis fréquents */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {quickAddresses.map((addr) => (
                    <button
                      key={addr}
                      type="button"
                      onClick={() => setFormData({ ...formData, pickUpLocation: addr })}
                      className="text-xs py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 shrink-0 transition-all"
                    >
                      📍 {addr}
                    </button>
                  ))}
                </div>

                {/* Lieu de prise en charge avec autocomplétion */}
                <div className="relative">
                  <label className="text-xs text-slate-400 mb-1 block">Lieu de Prise en Charge *</label>
                  <input
                    required
                    type="text"
                    placeholder="Tapez une adresse, aéroport, gare..."
                    value={formData.pickUpLocation}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    className="w-full bg-[#2c2c2e] border border-white/10 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none"
                  />
                  {isSearchingPickup && (
                    <div className="absolute right-3 top-9 text-xs text-emerald-400 animate-pulse">Recherche...</div>
                  )}

                  {/* Suggestions Pickup */}
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#252528] border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl">
                      {pickupSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, pickUpLocation: s.label });
                            setPickupSuggestions([]);
                          }}
                          className="w-full text-left p-3 hover:bg-emerald-600/20 border-b border-white/5 last:border-none flex items-center gap-2.5 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="overflow-hidden">
                            <div className="text-sm font-semibold text-white truncate">{s.name}</div>
                            <div className="text-xs text-slate-400 truncate">{s.postcode} {s.city} ({s.context})</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination (si transfert) */}
                {formData.tripType === 'transfer' && (
                  <div className="relative">
                    <label className="text-xs text-slate-400 mb-1 block">Destination Finale *</label>
                    <input
                      required
                      type="text"
                      placeholder="Adresse ou hôtel de dépose..."
                      value={formData.dropOffLocation}
                      onChange={(e) => handleDropoffChange(e.target.value)}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none"
                    />
                    {isSearchingDropoff && (
                      <div className="absolute right-3 top-9 text-xs text-emerald-400 animate-pulse">Recherche...</div>
                    )}

                    {/* Suggestions Dropoff */}
                    {dropoffSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#252528] border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl">
                        {dropoffSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, dropOffLocation: s.label });
                              setDropoffSuggestions([]);
                            }}
                            className="w-full text-left p-3 hover:bg-emerald-600/20 border-b border-white/5 last:border-none flex items-center gap-2.5 transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="text-sm font-semibold text-white truncate">{s.name}</div>
                              <div className="text-xs text-slate-400 truncate">{s.postcode} {s.city} ({s.context})</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION DATE, HEURE & PRESETS */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 3. Horaires Rapides
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => applyTimePreset(15)}
                      className="text-[11px] py-1 px-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 hover:bg-amber-500/30"
                    >
                      +15 min
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTimePreset(30)}
                      className="text-[11px] py-1 px-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 hover:bg-amber-500/30"
                    >
                      +30 min
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTomorrowPreset(8)}
                      className="text-[11px] py-1 px-2 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20"
                    >
                      Demain 8h
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Date *</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Heure *</label>
                    <input
                      required
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Passagers</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={formData.passengerCount}
                      onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Tarif TTC (€) *</label>
                    <input
                      required
                      type="number"
                      min={0}
                      step={5}
                      placeholder="0"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#2c2c2e] border border-emerald-500/50 focus:border-emerald-400 rounded-xl p-3 text-sm text-emerald-400 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Options MAD */}
              {formData.tripType === 'disposal' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Détails Mise à Disposition
                  </span>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Date Fin MAD</label>
                      <input
                        type="date"
                        value={formData.disposalEndDate}
                        onChange={(e) => setFormData({ ...formData, disposalEndDate: e.target.value })}
                        className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Heure Fin MAD</label>
                      <input
                        type="time"
                        value={formData.disposalEndTime}
                        onChange={(e) => setFormData({ ...formData, disposalEndTime: e.target.value })}
                        className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Zone Géographique</label>
                      <input
                        type="text"
                        placeholder="Ex: Île-de-France"
                        value={formData.disposalZone}
                        onChange={(e) => setFormData({ ...formData, disposalZone: e.target.value })}
                        className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Enregistrer la course
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
