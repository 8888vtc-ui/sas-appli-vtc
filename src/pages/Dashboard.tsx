import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Users, Plane, Search, ChevronDown,
  TrendingUp, BarChart3, ChevronRight, Play, CheckCircle2, Eye, FileText, Receipt, Trash2, StickyNote, PenTool, MessageCircle,
  QrCode, ShieldCheck, Wallet
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

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Planifiée' },
    in_progress: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'En cours' },
    completed: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Terminée' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Annulée' },
    invoiced: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: 'Facturée' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      {/* ══════════ RACCOURCIS TACTILES STYLE IPHONE (TOP WIDGETS) ══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <button
          onClick={() => navigate('/sign')}
          className="glass rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-amber-500/40 active:scale-95 transition-all group flex items-center gap-3 shadow-lg"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-all">
            <Plane className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">Accueil Aéroport</p>
            <p className="text-[10px] text-amber-400 font-medium truncate">Panneau Géant</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/notes-de-frais')}
          className="glass rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-purple-500/40 active:scale-95 transition-all group flex items-center gap-3 shadow-lg"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-all">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">Notes de Frais</p>
            <p className="text-[10px] text-purple-400 font-medium truncate">Scan & IK 2025</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/qrcode')}
          className="glass rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-yellow-500/40 active:scale-95 transition-all group flex items-center gap-3 shadow-lg"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-all">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">QR Code Pro</p>
            <p className="text-[10px] text-amber-300 font-medium truncate">Chevalet A5</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/controle')}
          className="glass rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-emerald-500/40 active:scale-95 transition-all group flex items-center gap-3 shadow-lg"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-bold shadow-md shadow-green-600/20 shrink-0 group-hover:scale-105 transition-all">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">Mode Contrôle</p>
            <p className="text-[10px] text-emerald-400 font-medium truncate">Police & Boers</p>
          </div>
        </button>
      </div>

      {/* ══════════ STATS CARDS (Apple Card Style) ══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: "Aujourd'hui", value: formatEUR(stats.todayRevenue), sub: `${stats.todayCount} course(s)`, icon: TrendingUp, color: '#3b82f6' },
          { label: 'Cette semaine', value: formatEUR(stats.weekRevenue), sub: `${stats.weekCount} course(s)`, icon: BarChart3, color: '#8b5cf6' },
          { label: 'Ce mois', value: formatEUR(stats.monthRevenue), sub: `${stats.monthCount} course(s)`, icon: TrendingUp, color: '#22c55e' },
          { label: 'Planifiées', value: String(stats.scheduledCount), sub: `${stats.transferCount} transferts · ${stats.disposalCount} MAD`, icon: Calendar, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-3.5 sm:p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-black text-white">{s.value}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ══════════ SEARCH & FILTERS ══════════ */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher passager, lieu, vol..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 outline-none text-xs sm:text-sm text-white placeholder-white/40 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-10 outline-none text-xs sm:text-sm text-white cursor-pointer focus:border-blue-500 font-medium"
          >
            <option value="all">Toutes les courses</option>
            <option value="scheduled">Planifiées</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="invoiced">Facturées</option>
            <option value="cancelled">Annulées</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
        </div>
      </div>

      {/* ══════════ TRIP LIST (Grandes cartes tactiles) ══════════ */}
      {filteredTrips.length === 0 ? (
        <div className="glass rounded-3xl p-8 sm:p-12 text-center border border-white/10">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40 text-white" />
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">
            {trips.length === 0 ? 'Aucune course enregistrée' : 'Aucun résultat'}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-4">
            {trips.length === 0 ? 'Touchez « Nouvelle Course » pour créer votre première réservation.' : 'Modifiez vos filtres de recherche.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredTrips.map(trip => (
            <motion.div
              key={trip.id}
              layout
              className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all shadow-xl"
            >
              {/* Ligne 1: Badge date + Client + Prix */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Badge Date Style iOS */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 shadow-md text-white"
                  style={{
                    background:
                      trip.tripType === 'disposal'
                        ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                        : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  }}
                >
                  <span className="text-[9px] sm:text-[10px] uppercase font-black opacity-80 leading-tight">
                    {format(new Date(trip.date), 'MMM')}
                  </span>
                  <span className="text-lg sm:text-xl font-black leading-tight">
                    {format(new Date(trip.date), 'dd')}
                  </span>
                </div>

                {/* Infos Passager */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[170px] sm:max-w-none">
                      {trip.clientName}
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
                      style={{
                        background: statusColors[trip.status]?.bg,
                        color: statusColors[trip.status]?.text,
                      }}
                    >
                      {statusColors[trip.status]?.label}
                    </span>
                    {trip.invoiceNumber && (
                      <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300">
                        {trip.invoiceNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> {trip.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {trip.passengerCount} passager(s)
                    </span>
                    {trip.flightNumber && (
                      <span className="flex items-center gap-1 font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                        <Plane className="w-3 h-3" /> {trip.flightNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Prix Tarif */}
                <div className="text-right shrink-0">
                  <p className="text-lg sm:text-xl font-black text-white">{formatEUR(trip.price)}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {trip.tripType === 'disposal' ? 'MAD' : 'Transfert'}
                  </p>
                </div>
              </div>

              {/* Ligne 2: Trajet (Lieu départ -> Arrivée) */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-xs sm:text-sm text-slate-300">
                <MapPin className="w-4 h-4 shrink-0 text-blue-400" />
                <span className="font-medium truncate">{trip.pickUpLocation}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span className="font-medium truncate text-slate-400">{trip.dropOffLocation || 'Mise à disposition'}</span>
              </div>

              {/* Ligne 3: BOUTONS D'ACTION TACTILES LISIBLES */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
                {/* Groupe 1: Statut de la course */}
                <div className="flex items-center gap-1.5">
                  {trip.status === 'scheduled' && (
                    <button
                      onClick={() => changeStatus(trip.id, 'in_progress')}
                      className="px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Démarrer
                    </button>
                  )}
                  {trip.status === 'in_progress' && (
                    <button
                      onClick={() => changeStatus(trip.id, 'completed')}
                      className="px-3 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terminer
                    </button>
                  )}
                </div>

                {/* Groupe 2: Actions Documents, Aéroport, WhatsApp, Signature */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {/* Bouton Panneau Aéroport */}
                  <button
                    onClick={() => navigate(`/sign/${trip.id}`)}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                    title="Ouvrir le panneau aéroport pour ce client"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Aéroport</span>
                  </button>

                  {/* Bouton Bon de Commande VTC */}
                  <button
                    onClick={() => generateBon(trip)}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                    title="Télécharger le Bon de Commande VTC conforme"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Bon VTC</span>
                  </button>

                  {/* Bouton Signature tactile */}
                  <button
                    onClick={() => setSigTripId(trip.id)}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                    title="Faire signer le client"
                  >
                    <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                    {trip.signature ? <span className="text-emerald-400 font-bold">✓ Signé</span> : <span className="hidden sm:inline">Signer</span>}
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => shareOnWhatsApp(trip)}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                    title="Envoyer confirmation WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  {/* Facturer */}
                  {trip.status !== 'invoiced' && (
                    <button
                      onClick={() => invoiceTrip(trip)}
                      className="px-2.5 sm:px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                      title="Créer la facture"
                    >
                      <Receipt className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Facturer</span>
                    </button>
                  )}

                  {/* Supprimer */}
                  {confirmDelete === trip.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold"
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 text-white text-xs"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(trip.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shrink-0"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {trip.notes && (
                <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-start gap-2 text-[11px] text-slate-400">
                  <StickyNote className="w-3.5 h-3.5 mt-0.5 text-yellow-400 shrink-0" />
                  <span>{trip.notes}</span>
                </div>
              )}
            </motion.div>
          ))}
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
