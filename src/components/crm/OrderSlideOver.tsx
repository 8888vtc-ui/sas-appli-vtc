import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  X, FileText, Download, Phone, CalendarDays, Clock, Users, Plane, Receipt, CalendarPlus
} from 'lucide-react';
import type { Trip } from '../../types';
import { formatEUR } from '../../lib/utils';
import { STATUS } from '../dashboard/TripRow';

interface Props {
  open: boolean;
  clientName: string;
  clientPhone?: string;
  trips: Trip[];
  onClose: () => void;
  onDownloadBon: (trip: Trip) => void;
  onGenerateInvoice: (trip: Trip) => void;
}

const ts = (t: Trip) => new Date(`${t.date}T${t.time || '00:00'}`).getTime();

/** Course affichée par défaut : la prochaine à venir, sinon la plus récente. */
function defaultTrip(trips: Trip[]): Trip | null {
  const now = Date.now();
  const upcoming = trips
    .filter(t => (t.status === 'scheduled' || t.status === 'in_progress') && ts(t) >= now - 3 * 3600_000)
    .sort((a, b) => ts(a) - ts(b))[0];
  return upcoming || [...trips].sort((a, b) => ts(b) - ts(a))[0] || null;
}

/* Slide-over "Bon de commande" — détail d'une course d'un client */
export default function OrderSlideOver({ open, clientName, clientPhone, trips, onClose, onDownloadBon, onGenerateInvoice }: Props) {
  const sorted = useMemo(() => [...trips].sort((a, b) => ts(b) - ts(a)), [trips]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Réinitialise la course sélectionnée à chaque ouverture
  useEffect(() => {
    if (open) setSelectedId(defaultTrip(trips)?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Échap + blocage du scroll de fond
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const trip = sorted.find(t => t.id === selectedId) || null;
  const st = trip ? STATUS[trip.status] : null;
  const canInvoice = trip && (trip.status === 'completed' || trip.status === 'invoiced');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="order-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm"
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-neutral-900 text-white border-l border-white/10 shadow-2xl flex flex-col pt-[env(safe-area-inset-top,0px)]"
          >
            {/* En-tête */}
            <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#00ff87]">Bon de commande</p>
                <h2 id="order-title" className="text-xl font-bold truncate mt-0.5">{clientName}</h2>
                {trip && <p className="text-sm text-neutral-400 font-mono">N° BC-{trip.id.slice(0, 8).toUpperCase()}</p>}
              </div>
              <button id="order-close" aria-label="Fermer" onClick={onClose} className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0">
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Sélecteur de course si plusieurs */}
            {sorted.length > 1 && (
              <div className="px-5 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{sorted.length} courses</p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
                  {sorted.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`shrink-0 px-3 min-h-[44px] rounded-xl text-sm font-semibold border transition-colors ${
                        t.id === selectedId ? 'bg-[#00ff87]/10 border-[#00ff87]/50 text-[#00ff87]' : 'bg-white/5 border-transparent text-neutral-300'
                      }`}
                    >
                      {format(new Date(`${t.date}T00:00:00`), 'd MMM', { locale: fr })} · {t.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Corps */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {!trip ? (
                <div className="flex flex-col items-center text-center gap-3 py-16 text-neutral-400">
                  <FileText className="w-10 h-10 opacity-40" />
                  <p className="text-base">Aucune course enregistrée pour ce contact.</p>
                  <button
                    onClick={() => { onClose(); window.dispatchEvent(new Event('open-new-trip')); }}
                    className="inline-flex items-center gap-2 px-4 min-h-[48px] rounded-xl bg-[#00ff87]/10 text-[#00ff87] text-sm font-bold"
                  >
                    <CalendarPlus className="w-5 h-5" /> Créer une course
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Prix + statut */}
                  <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0f2a1c] to-neutral-950 border border-[#00ff87]/15 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Prix TTC</p>
                      <p className="text-4xl font-black tracking-tight">{formatEUR(trip.price)}</p>
                    </div>
                    {st && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white/5" style={{ color: st.color }}>
                        {st.label}
                      </span>
                    )}
                  </div>

                  {/* Date / heure */}
                  <div className="grid grid-cols-2 gap-3">
                    <Info icon={CalendarDays} label="Date" value={format(new Date(`${trip.date}T00:00:00`), 'EEEE d MMMM yyyy', { locale: fr })} />
                    <Info icon={Clock} label="Heure" value={trip.time} />
                    <Info icon={Users} label="Passagers" value={String(trip.passengerCount || 1)} />
                    {trip.flightNumber
                      ? <Info icon={Plane} label="Vol" value={trip.flightNumber} />
                      : <Info icon={FileText} label="Type" value={trip.tripType === 'disposal' ? 'Mise à dispo' : 'Transfert'} />}
                  </div>

                  {/* Itinéraire */}
                  <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/5 flex flex-col gap-4">
                    <Stop label="Départ" value={trip.pickUpLocation} dot="bg-[#00ff87]" line />
                    <Stop label="Arrivée" value={trip.dropOffLocation || 'Mise à disposition'} dot="bg-white" />
                  </div>

                  {/* Client */}
                  <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Client</p>
                      <p className="text-base font-semibold truncate">{trip.clientName}</p>
                      {(trip.clientPhone || clientPhone) && <p className="text-sm text-neutral-400">{trip.clientPhone || clientPhone}</p>}
                    </div>
                    {(trip.clientPhone || clientPhone) && (
                      <a href={`tel:${trip.clientPhone || clientPhone}`} aria-label="Appeler" className="w-11 h-11 rounded-full bg-[#00ff87]/10 text-[#00ff87] flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {trip.notes && (
                    <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Notes</p>
                      <p className="text-sm text-neutral-200 whitespace-pre-line">{trip.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {trip && (
              <footer className="px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 grid grid-cols-2 gap-3 bg-neutral-900">
                <button
                  id="order-download-bon"
                  onClick={() => onDownloadBon(trip)}
                  className="min-h-[52px] rounded-xl bg-[#00ff87] text-[#00391c] font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Download className="w-5 h-5" /> Bon PDF
                </button>
                <button
                  id="order-generate-invoice"
                  onClick={() => onGenerateInvoice(trip)}
                  disabled={!canInvoice}
                  title={canInvoice ? undefined : 'Disponible une fois la course terminée'}
                  className="min-h-[52px] rounded-xl bg-white/10 hover:bg-white/15 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Receipt className="w-5 h-5" /> {trip.status === 'invoiced' ? 'Facture PDF' : 'Facturer'}
                </button>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3.5 bg-white/[0.04] border border-white/5 min-w-0">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className="text-base font-semibold mt-1 capitalize truncate">{value}</p>
    </div>
  );
}

function Stop({ label, value, dot, line }: { label: string; value: string; dot: string; line?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1.5">
        <span className={`w-3 h-3 rounded-full ${dot}`} />
        {line && <span className="w-0.5 h-8 mt-1 bg-white/15" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</p>
        <p className="text-base font-semibold leading-snug">{value}</p>
      </div>
    </div>
  );
}
