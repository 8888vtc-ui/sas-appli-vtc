import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ExpenseCategory } from '../types';
import { useApp } from '../context/AppContext';
import { scanReceiptWithAI } from '../lib/aiScanner';
import { showToast } from './Toast';

interface QuickSnapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    tvaDeductible: boolean;
    tvaRate: number;
    tvaAmount: number;
    notes?: string;
    receiptPhoto?: string;
    receiptFileName?: string;
  }) => void;
}

const PRESETS: Array<{
  id: string;
  label: string;
  icon: string;
  category: ExpenseCategory;
  description: string;
  tvaRate: number;
  tvaDeductible: boolean;
}> = [
  { id: 'fuel', label: 'Carburant', icon: '⛽', category: 'fuel', description: 'Plein Carburant', tvaRate: 20, tvaDeductible: true },
  { id: 'toll', label: 'Péage', icon: '🛣️', category: 'toll', description: 'Péage Autoroute', tvaRate: 20, tvaDeductible: true },
  { id: 'wash', label: 'Lavage', icon: '🧽', category: 'wash', description: 'Lavage Véhicule Pro', tvaRate: 20, tvaDeductible: true },
  { id: 'supplies', label: 'Fournitures', icon: '🛒', category: 'supplies', description: 'Bouteilles eau / Bonbons VIP', tvaRate: 20, tvaDeductible: true },
  { id: 'parking', label: 'Parking', icon: '🅿️', category: 'parking', description: 'Stationnement Client', tvaRate: 20, tvaDeductible: true },
];

export default function QuickSnapExpenseModal({ isOpen, onClose, onSave }: QuickSnapModalProps) {
  const { settings } = useApp();
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [amount, setAmount] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setPhoto(base64);
      setPhotoName(file.name);
      
      // Auto-scan avec l'IA si activé
      if (settings.appMode === 'ai') {
        try {
          setIsScanning(true);
          const result = await scanReceiptWithAI(settings, base64);
          
          // Mettre à jour le formulaire avec les données de l'IA
          if (result.amount) setAmount(result.amount.toString());
          if (result.category) {
            const match = PRESETS.find(p => p.category === result.category);
            if (match) setSelectedPreset(match);
          }
          showToast('Bim ! Ticket analysé par l\'IA avec succès.', 'success');
        } catch (error: any) {
          showToast(error.message, 'error');
        } finally {
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!numAmount || numAmount <= 0) return;

    const tvaAmount = selectedPreset.tvaDeductible
      ? (numAmount * selectedPreset.tvaRate) / (100 + selectedPreset.tvaRate)
      : 0;

    onSave({
      description: selectedPreset.description,
      amount: numAmount,
      category: selectedPreset.category,
      date: format(new Date(), 'yyyy-MM-dd'),
      tvaDeductible: selectedPreset.tvaDeductible,
      tvaRate: selectedPreset.tvaRate,
      tvaAmount,
      receiptPhoto: photo,
      receiptFileName: photoName || (photo ? 'ticket_scan.jpg' : undefined),
    });

    // Reset
    setAmount('');
    setPhoto('');
    setPhotoName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-[env(safe-area-inset-bottom,0px)] bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md bg-[#1c1c1e] border border-white/10 p-5 rounded-t-3xl sm:rounded-3xl text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Quick-Snap Ticket (3s)</h3>
                <p className="text-xs text-slate-400">Saisie express ticket & déduction TVA</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Presets rapides */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">1. Choisissez le type de dépense :</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPreset(p)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedPreset.id === p.id
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{p.icon}</div>
                    <div className="text-xs truncate">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Montant TTC en grand */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">2. Montant Total Payé (€ TTC) * :</label>
              <div className="relative">
                <input
                  required
                  autoFocus
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#2c2c2e] border-2 border-amber-500/50 focus:border-amber-400 rounded-2xl py-3.5 px-4 text-2xl font-black text-white text-center outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
              </div>
              <div className="text-center text-xs text-emerald-400 mt-1">
                TVA estimée déductible ({selectedPreset.tvaRate}%) :{' '}
                {amount && parseFloat(amount) > 0
                  ? ((parseFloat(amount) * selectedPreset.tvaRate) / (100 + selectedPreset.tvaRate)).toFixed(2)
                  : '0.00'}{' '}
                €
              </div>
            </div>

            {/* Photo / Justificatif */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">3. Photo du ticket (Optionnel) :</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
              />

              {photo ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-emerald-500/10 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={photo} alt="Aperçu reçu" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-xs text-emerald-300 font-medium">Reçu photographié ✓</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto('');
                      setPhotoName('');
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 text-xs font-bold"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className={`w-full py-4 px-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 text-sm transition-colors ${
                    settings.appMode === 'ai'
                      ? 'border-purple-500/50 hover:border-purple-400 bg-purple-500/10 text-purple-300 hover:text-white'
                      : 'border-white/20 hover:border-white/40 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className={`w-6 h-6 animate-spin ${settings.appMode === 'ai' ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="font-bold">Analyse en cours...</span>
                    </>
                  ) : settings.appMode === 'ai' ? (
                    <>
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <span className="font-bold">Scanner avec l'IA (Remplissage Auto)</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 border-2 border-slate-400 rounded-md flex items-center justify-center mb-1">+</div>
                      <span className="font-bold">Joindre une photo du reçu</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Bouton de validation immédiat */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" /> Enregistrer le reçu
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
