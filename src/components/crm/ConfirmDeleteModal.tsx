import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  detail?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/* Modale de confirmation générique (suppression, actions irréversibles) */
export default function ConfirmDeleteModal({
  open,
  title = 'Supprimer cet élément ?',
  message = 'Voulez-vous vraiment supprimer cet élément ?',
  detail,
  confirmLabel = 'Supprimer',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  // Fermeture au clavier (Échap)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => !loading && onCancel()}
          className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 pb-[env(safe-area-inset-bottom,0px)]"
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-neutral-900 text-white border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 id="confirm-title" className="text-lg font-bold">{title}</h3>
            <p className="text-sm text-neutral-300 mt-1">{message}</p>
            {detail && <p className="text-sm text-neutral-400 mt-3 rounded-xl bg-white/5 px-3 py-2">{detail}</p>}

            <div className="flex gap-3 mt-6">
              <button
                id="confirm-cancel"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 min-h-[48px] rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-sm transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                id="confirm-delete"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 min-h-[48px] rounded-xl bg-red-500 hover:bg-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
