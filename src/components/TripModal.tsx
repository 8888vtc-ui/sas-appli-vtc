import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';

interface TripFormData {
  clientName: string; clientPhone: string; clientEmail: string;
  pickUpLocation: string; dropOffLocation: string;
  date: string; time: string; flightNumber: string;
  passengerCount: number; price: number;
  tripType: 'transfer' | 'disposal';
  disposalEndDate: string; disposalEndTime: string; disposalZone: string;
  notes: string;
}

const emptyForm: TripFormData = {
  clientName: '', clientPhone: '', clientEmail: '', pickUpLocation: '', dropOffLocation: '',
  date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'),
  flightNumber: '', passengerCount: 1, price: 0, tripType: 'transfer',
  disposalEndDate: '', disposalEndTime: '', disposalZone: '', notes: ''
};

export default function TripModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addTrip } = useApp();
  const [formData, setFormData] = useState<TripFormData>({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrip(formData);
    setFormData({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });
    onClose();
  };

  const handleClose = () => {
    setFormData({ ...emptyForm, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="glass max-w-2xl w-full p-8 rounded-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Nouvelle Réservation</h2>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Trip Type Toggle */}
            <div className="flex gap-2 mb-6">
              {(['transfer', 'disposal'] as const).map(t => (
                <button key={t} onClick={() => setFormData({ ...formData, tripType: t })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.tripType === t ? 'bg-white/15 border border-white/20 text-white' : 'bg-white/5 border border-transparent text-white/60'}`}>
                  {t === 'transfer' ? '🚗 Transfert A→B' : '⏱️ Mise à Disposition'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {([
                  ['Nom Client *', 'clientName', 'text', 'Jean Dupont', true],
                  ['Téléphone Client *', 'clientPhone', 'tel', '+33 6 12 34 56 78', true],
                  ['Email Client', 'clientEmail', 'email', 'client@email.com', false],
                  ['Lieu Prise en Charge *', 'pickUpLocation', 'text', 'Aéroport Nice T2', true],
                  ['Destination', 'dropOffLocation', 'text', 'Hôtel Martinez Cannes', formData.tripType === 'transfer'],
                  ['Date *', 'date', 'date', '', true],
                  ['Heure *', 'time', 'time', '', true],
                  ['N° Vol/Train', 'flightNumber', 'text', 'AF1234', false],
                  ['Passagers', 'passengerCount', 'number', '', false],
                  ['Prix (EUR) *', 'price', 'number', '', true],
                ] as const).map(([label, key, type, ph, req]) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</label>
                    <input required={!!req} type={type} placeholder={ph as string}
                      value={formData[key as keyof TripFormData]}
                      onChange={e => setFormData({ ...formData, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-sm text-white placeholder-white/20" />
                  </div>
                ))}
                {formData.tripType === 'disposal' && (<>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: '#94A3B8' }}>Date Fin MAD</label>
                    <input type="date" value={formData.disposalEndDate}
                      onChange={e => setFormData({ ...formData, disposalEndDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-sm text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: '#94A3B8' }}>Heure Fin MAD</label>
                    <input type="time" value={formData.disposalEndTime}
                      onChange={e => setFormData({ ...formData, disposalEndTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-sm text-white" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium" style={{ color: '#94A3B8' }}>Zone Géographique</label>
                    <input type="text" value={formData.disposalZone} placeholder="ex: Côte d'Azur"
                      onChange={e => setFormData({ ...formData, disposalZone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-sm text-white placeholder-white/20" />
                  </div>
                </>)}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium" style={{ color: '#94A3B8' }}>Notes / Observations</label>
                  <textarea value={formData.notes} placeholder="Informations complémentaires..."
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-sm text-white placeholder-white/20 resize-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1 text-white">Annuler</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
