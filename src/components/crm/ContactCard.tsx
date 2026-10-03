import { motion } from 'framer-motion';
import { Phone, Mail, Tag, MessageCircle, Trash2, FileText, Check, ChevronRight, Loader2 } from 'lucide-react';
import { CATEGORIES, type Contact } from './types';

interface Props {
  contact: Contact;
  selected: boolean;
  invoicing?: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onRequestDelete: () => void;
  onGenerateInvoice: () => void;
}

const daysColor = (d: number) => (d > 60 ? 'text-red-400' : d > 30 ? 'text-amber-400' : 'text-[#00ff87]');

/* Carte client / course — zone principale cliquable → Bon de commande */
export default function ContactCard({ contact, selected, invoicing, onToggleSelect, onOpen, onRequestDelete, onGenerateInvoice }: Props) {
  const cat = CATEGORIES[contact.category] ?? CATEGORIES.particulier;
  const days = contact.lastContact
    ? Math.max(0, Math.floor((Date.now() - new Date(contact.lastContact).getTime()) / 86_400_000))
    : null;
  const isClient = contact.type === 'client';
  const phoneDigits = contact.phone.replace(/[^0-9]/g, '');

  /** Toutes les actions rapides stoppent la propagation pour ne pas ouvrir le bon de commande. */
  const stop = (fn?: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn?.(); };

  const actionBtn = 'flex-1 sm:flex-none sm:w-11 h-11 rounded-xl flex items-center justify-center transition-colors';

  return (
    <motion.article
      layout
      role="button"
      tabIndex={0}
      aria-label={`Ouvrir le bon de commande de ${contact.name}`}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      className={`group bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 border cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00ff87]/60 ${
        selected ? 'border-[#00ff87]/50 bg-[#00ff87]/[0.04]' : 'border-white/[0.06] hover:border-white/15'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Case de sélection (campagne SMS) */}
        <button
          aria-label={selected ? 'Désélectionner' : 'Sélectionner'}
          aria-pressed={selected}
          onClick={stop(onToggleSelect)}
          className="w-11 h-11 -m-2 flex items-center justify-center shrink-0"
        >
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selected ? 'bg-[#00ff87] border-[#00ff87]' : 'border-white/25'}`}>
            {selected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
          </span>
        </button>

        {/* Avatar catégorie */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}1f` }}>
          <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
        </div>

        {/* Identité */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold truncate">{contact.name}</h3>
            <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isClient ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'bg-white/10 text-neutral-300'}`}>
              {isClient ? 'Client' : 'Prospect'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/5 text-neutral-300">{cat.label}</span>
          </div>
          <div className="flex items-center gap-x-3 gap-y-1 mt-2 text-sm text-neutral-400 flex-wrap">
            {contact.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{contact.phone}</span>}
            {contact.email && <span className="flex items-center gap-1.5 min-w-0 truncate"><Mail className="w-3.5 h-3.5 shrink-0" />{contact.email}</span>}
            {contact.source && <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{contact.source}</span>}
          </div>
        </div>
      </div>

      {/* Statistiques + actions rapides */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5 min-w-0">
          <Stat value={String(contact.totalTrips)} label="courses" />
          <Stat value={`${contact.totalRevenue.toFixed(0)} €`} label="CA" valueClass="text-[#00ff87]" />
          {days !== null && <Stat value={`${days} j`} label="dernier" valueClass={daysColor(days)} />}
        </div>

        <div className="flex items-center gap-2 sm:gap-1.5 sm:shrink-0">
          {contact.phone && (
            <>
              <a
                href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                aria-label="WhatsApp" title="WhatsApp"
                className={`${actionBtn} bg-[#00ff87]/10 text-[#00ff87] hover:bg-[#00ff87]/20`}
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={`tel:${contact.phone}`}
                onClick={e => e.stopPropagation()}
                aria-label="Appeler" title="Appeler"
                className={`${actionBtn} bg-white/5 text-white hover:bg-white/10`}
              >
                <Phone className="w-5 h-5" />
              </a>
            </>
          )}
          <button
            onClick={stop(onGenerateInvoice)}
            disabled={contact.totalTrips === 0 || invoicing}
            aria-label="Générer la facture" title={contact.totalTrips === 0 ? 'Aucune course à facturer' : 'Générer la facture'}
            className={`${actionBtn} bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {invoicing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          </button>
          <button
            onClick={stop(onRequestDelete)}
            aria-label="Supprimer" title="Supprimer"
            className={`${actionBtn} bg-red-500/10 text-red-400 hover:bg-red-500/20`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function Stat({ value, label, valueClass = 'text-white' }: { value: string; label: string; valueClass?: string }) {
  return (
    <div className="min-w-0">
      <p className={`text-base font-bold leading-tight ${valueClass}`}>{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
