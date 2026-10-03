import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, FileText, Trash2, PenTool, MessageCircle, MoreHorizontal } from 'lucide-react';
import type { Trip } from '../../types';
import { formatEUR } from '../../lib/utils';
import { theme as t } from '../../lib/theme';
import { getCountdown } from '../../lib/countdown';

export const STATUS: Record<Trip['status'], { label: string; color: string }> = {
  scheduled:   { label: 'Planifiée', color: t.textMuted },
  in_progress: { label: 'En cours',  color: t.emerald },
  completed:   { label: 'Terminée',  color: t.text },
  invoiced:    { label: 'Facturée',  color: t.emerald },
  cancelled:   { label: 'Annulée',   color: t.danger },
};

interface Props {
  trip: Trip;
  now: number;
  dateLabel: string;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
  onComplete: () => void;
  onInvoice: () => void;
  onBon: () => void;
  onFacturePdf: () => void;
  onWhatsApp: () => void;
  onSignature: () => void;
  onDelete: () => void;
}

/* Ligne de course (liste "À venir" / "Historique") avec actions dépliables */
export default function TripRow(p: Props) {
  const { trip, open } = p;
  const [more, setMore] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const st = STATUS[trip.status];
  const cd = getCountdown(trip, p.now);

  const iconBtn = 'w-14 min-h-[52px] rounded-xl flex items-center justify-center active:scale-95 transition-transform';
  const mainBtn = 'flex-1 min-h-[52px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform';
  const subBtn = 'min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-sm font-semibold';

  return (
    <div className="flex flex-col">
      <button
        onClick={() => { p.onToggle(); setMore(false); setConfirmDel(false); }}
        className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-2xl border transition-colors"
        style={{ backgroundColor: open ? t.surfaceHigh : t.surface, borderColor: open ? t.border : 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col items-center justify-center w-16 h-14 rounded-xl shrink-0" style={{ backgroundColor: t.surfaceLowest }}>
            <span className="text-lg font-extrabold leading-none" style={{ color: t.text }}>{trip.time}</span>
            <span className="text-xs font-semibold mt-1 truncate max-w-full px-1" style={{ color: t.textMuted }}>{p.dateLabel}</span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold truncate" style={{ color: t.text }}>{trip.clientName}</p>
            <p className="text-sm truncate" style={{ color: t.textMuted }}>{trip.pickUpLocation}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-base font-extrabold" style={{ color: t.text }}>{formatEUR(trip.price)}</span>
          {cd ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: cd.bg, color: cd.color }}>{cd.label}</span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: st.color }}>{st.label}</span>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 p-3 rounded-2xl flex flex-col gap-2" style={{ backgroundColor: t.surfaceLowest }}>
              <div className="flex gap-2">
                {trip.status === 'scheduled' && (
                  <>
                    <button onClick={p.onBon} aria-label="Bon de commande" className={iconBtn} style={{ backgroundColor: t.surfaceHigh }}>
                      <FileText className="w-5 h-5" style={{ color: t.emerald }} />
                    </button>
                    <button onClick={p.onStart} className={mainBtn} style={{ backgroundColor: t.emerald, color: t.onEmerald }}>
                      <Play className="w-4 h-4" /> Démarrer
                    </button>
                  </>
                )}
                {trip.status === 'in_progress' && (
                  <button onClick={p.onComplete} className={mainBtn} style={{ backgroundColor: t.text, color: t.bg }}>
                    <CheckCircle2 className="w-4 h-4" /> Terminer
                  </button>
                )}
                {trip.status === 'completed' && (
                  <button onClick={p.onInvoice} className={mainBtn} style={{ backgroundColor: t.emerald, color: t.onEmerald }}>
                    <FileText className="w-4 h-4" /> Facturer
                  </button>
                )}
                {(trip.status === 'invoiced' || trip.status === 'cancelled') && <div className="flex-1" />}
                <button onClick={p.onWhatsApp} aria-label="WhatsApp" className={iconBtn} style={{ backgroundColor: t.emeraldSoft }}>
                  <MessageCircle className="w-5 h-5" style={{ color: t.emerald }} />
                </button>
                <button onClick={() => setMore(m => !m)} aria-label="Plus d'actions" className={iconBtn} style={{ backgroundColor: t.surfaceHigh }}>
                  <MoreHorizontal className="w-5 h-5" style={{ color: t.text }} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {more && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button onClick={p.onBon} className={subBtn} style={{ backgroundColor: t.surfaceHigh, color: t.text }}>
                        <FileText className="w-4 h-4" style={{ color: t.emerald }} /> Bon VTC
                      </button>
                      <button onClick={p.onSignature} className={subBtn} style={{ backgroundColor: t.surfaceHigh, color: t.text }}>
                        <PenTool className="w-4 h-4" style={{ color: t.textMuted }} /> Signature
                      </button>
                      {confirmDel ? (
                        <div className="col-span-2 flex gap-2">
                          <button onClick={p.onDelete} className={`${subBtn} flex-1 font-bold`} style={{ backgroundColor: t.danger, color: '#fff' }}>Confirmer</button>
                          <button onClick={() => setConfirmDel(false)} className={`${subBtn} flex-1`} style={{ backgroundColor: t.surfaceHigh, color: t.text }}>Annuler</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(true)} className={`${subBtn} col-span-2 font-bold`} style={{ backgroundColor: `${t.danger}1f`, color: t.danger }}>
                          <Trash2 className="w-4 h-4" /> Supprimer la course
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {(trip.status === 'completed' || trip.status === 'invoiced') && (
                <button onClick={p.onFacturePdf} className="w-full min-h-[52px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm" style={{ backgroundColor: t.surfaceHigh, color: t.text }}>
                  <FileText className="w-5 h-5" style={{ color: t.emerald }} /> Générer la facture PDF
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
