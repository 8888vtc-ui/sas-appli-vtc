import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Plane, Search,
  TrendingUp, ChevronRight, Play, CheckCircle2,
  FileText, Trash2, PenTool, MessageCircle, MoreHorizontal
} from 'lucide-react';
import SignatureModal from '../components/SignatureModal';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';

export default function Dashboard() {
  const { trips, stats, changeStatus, invoiceTrip, generateBon, deleteTrip, addSignature, settings } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sigTripId, setSigTripId] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const shareOnWhatsApp = (trip: any) => {
    const text = `Bonjour ${trip.clientName}, voici la confirmation de votre course VTC le ${trip.date} à ${trip.time}. Départ: ${trip.pickUpLocation}. Destination: ${trip.dropOffLocation || 'Mise à disposition'}. Tarif convenu: ${trip.price}€. Merci de votre confiance. ${settings.companyName}`;
    const cleanPhone = (trip.clientPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredTrips = trips
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t =>
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.pickUpLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.dropOffLocation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.flightNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', label: 'Planifiée' },
    in_progress: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', label: 'En cours' },
    completed: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', label: 'Terminée' },
    cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', label: 'Annulée' },
    invoiced: { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', label: 'Facturée' },
  };

  // Filter chips
  const filterChips = [
    { key: 'all', label: 'Toutes' },
    { key: 'scheduled', label: 'Planifiées' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'completed', label: 'Terminées' },
    { key: 'invoiced', label: 'Facturées' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* ── 3 STATS SIMPLES ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aujourd'hui", value: formatEUR(stats.todayRevenue), count: stats.todayCount },
          { label: 'Semaine', value: formatEUR(stats.weekRevenue), count: stats.weekCount },
          { label: 'Mois', value: formatEUR(stats.monthRevenue), count: stats.monthCount },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 sm:p-4 bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mb-1">{s.label}</p>
            <p className="text-base sm:text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.count} course{s.count !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* ── BARRE DE RECHERCHE ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-9 pr-4 outline-none text-sm text-white placeholder-slate-600 focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* ── FILTRE CHIPS ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {filterChips.map(c => (
          <button key={c.key}
            onClick={() => setStatusFilter(c.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === c.key
                ? 'bg-blue-600 text-white'
                : 'bg-white/[0.04] text-slate-500 hover:text-slate-300'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── LISTE DES COURSES ── */}
      {filteredTrips.length === 0 ? (
        <div className="rounded-2xl p-10 text-center bg-white/[0.02] border border-white/[0.04]">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400 mb-1">
            {trips.length === 0 ? 'Aucune course' : 'Aucun résultat'}
          </p>
          <p className="text-xs text-slate-600">
            {trips.length === 0 ? 'Créez votre première course avec le bouton +' : 'Modifiez vos filtres.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTrips.map(trip => {
            const sc = statusConfig[trip.status];
            const isExpanded = expandedTrip === trip.id;

            return (
              <motion.div key={trip.id} layout
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden transition-all hover:border-white/[0.1]">

                {/* Ligne principale — cliquable pour expandre */}
                <button
                  onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                  className="w-full flex items-center gap-3 p-3 sm:p-4 text-left">
                  {/* Mini-badge date */}
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                    style={{ background: trip.tripType === 'disposal' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)' }}>
                    <span className="text-[8px] uppercase font-bold leading-tight"
                      style={{ color: trip.tripType === 'disposal' ? '#fbbf24' : '#60a5fa' }}>
                      {format(new Date(trip.date), 'MMM')}
                    </span>
                    <span className="text-sm font-bold leading-tight"
                      style={{ color: trip.tripType === 'disposal' ? '#fbbf24' : '#60a5fa' }}>
                      {format(new Date(trip.date), 'dd')}
                    </span>
                  </div>

                  {/* Nom + trajet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{trip.clientName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0"
                        style={{ background: sc?.bg, color: sc?.text }}>
                        {sc?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3" /> {trip.time}
                      <span className="mx-1">·</span>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{trip.pickUpLocation}</span>
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatEUR(trip.price)}</p>
                    {trip.flightNumber && (
                      <p className="text-[9px] text-sky-400 font-semibold flex items-center gap-0.5 justify-end">
                        <Plane className="w-2.5 h-2.5" /> {trip.flightNumber}
                      </p>
                    )}
                  </div>

                  <MoreHorizontal className={`w-4 h-4 text-slate-600 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Actions (expansion douce) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-white/[0.04]">
                        {/* Trajet complet */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{trip.pickUpLocation}</span>
                          <ChevronRight className="w-3 h-3 shrink-0 text-slate-600" />
                          <span className="truncate">{trip.dropOffLocation || 'MAD'}</span>
                        </div>

                        {/* Boutons d'action en grille 2x3 */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* Statut */}
                          {trip.status === 'scheduled' && (
                            <button onClick={() => changeStatus(trip.id, 'in_progress')}
                              className="py-2 rounded-lg bg-green-500/10 text-green-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                              <Play className="w-3 h-3" /> Démarrer
                            </button>
                          )}
                          {trip.status === 'in_progress' && (
                            <button onClick={() => changeStatus(trip.id, 'completed')}
                              className="py-2 rounded-lg bg-emerald-500 text-black text-[11px] font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Terminer
                            </button>
                          )}

                          {/* Panneau aéroport */}
                          <button onClick={() => navigate(`/sign/${trip.id}`)}
                            className="py-2 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                            <Plane className="w-3 h-3" /> Aéroport
                          </button>

                          {/* Bon VTC */}
                          <button onClick={() => generateBon(trip)}
                            className="py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                            <FileText className="w-3 h-3" /> Bon VTC
                          </button>

                          {/* Signature */}
                          <button onClick={() => setSigTripId(trip.id)}
                            className="py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                            <PenTool className="w-3 h-3" />
                            {trip.signature ? '✓ Signé' : 'Signer'}
                          </button>

                          {/* WhatsApp */}
                          <button onClick={() => shareOnWhatsApp(trip)}
                            className="py-2 rounded-lg bg-green-500/10 text-green-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </button>

                          {/* Facturer / Supprimer */}
                          {trip.status !== 'invoiced' ? (
                            <button onClick={() => invoiceTrip(trip)}
                              className="py-2 rounded-lg bg-purple-500/10 text-purple-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                              <TrendingUp className="w-3 h-3" /> Facturer
                            </button>
                          ) : (
                            confirmDelete === trip.id ? (
                              <div className="flex items-center gap-1 col-span-1">
                                <button onClick={() => deleteTrip(trip.id)}
                                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-[11px] font-bold">Oui</button>
                                <button onClick={() => setConfirmDelete(null)}
                                  className="flex-1 py-2 rounded-lg bg-white/5 text-white text-[11px]">Non</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDelete(trip.id)}
                                className="py-2 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                                <Trash2 className="w-3 h-3" /> Supprimer
                              </button>
                            )
                          )}
                        </div>

                        {trip.notes && (
                          <p className="mt-2 text-[11px] text-slate-500 italic">{trip.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modale Signature */}
      <SignatureModal
        isOpen={!!sigTripId}
        onClose={() => setSigTripId(null)}
        initialSignature={trips.find(t => t.id === sigTripId)?.signature}
        onSave={data => {
          if (sigTripId) {
            addSignature(sigTripId, data);
            setSigTripId(null);
          }
        }}
      />
    </motion.div>
  );
}
