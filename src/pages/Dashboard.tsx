import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Users, Phone, Plane, Search, ChevronDown,
  TrendingUp, BarChart3, ChevronRight, Hash, Play, CheckCircle2, Ban, Eye, FileText, FolderOpen, Receipt, Trash2, StickyNote, PenTool, MessageCircle
} from 'lucide-react';
import SignatureModal from '../components/SignatureModal';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';

export default function Dashboard() {
  const { trips, stats, changeStatus, invoiceTrip, generateBon, generateMAD, deleteTrip } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sigTripId, setSigTripId] = useState<string | null>(null);
  const { addSignature, settings } = useApp();

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Aujourd'hui", value: formatEUR(stats.todayRevenue), sub: `${stats.todayCount} course(s)`, icon: TrendingUp, color: '#3b82f6' },
          { label: 'Cette semaine', value: formatEUR(stats.weekRevenue), sub: `${stats.weekCount} course(s)`, icon: BarChart3, color: '#8b5cf6' },
          { label: 'Ce mois', value: formatEUR(stats.monthRevenue), sub: `${stats.monthCount} course(s)`, icon: TrendingUp, color: '#22c55e' },
          { label: 'Planifiées', value: String(stats.scheduledCount), sub: `${stats.transferCount} transferts · ${stats.disposalCount} MAD`, icon: Calendar, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{s.label}</span>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input type="text" placeholder="Rechercher client, lieu, vol..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none text-sm text-white placeholder-white/30" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 outline-none text-sm text-white cursor-pointer">
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifiées</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="invoiced">Facturées</option>
            <option value="cancelled">Annulées</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#64748b' }} />
        </div>
      </div>

      {/* Trip List */}
      {filteredTrips.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-white" />
          <h3 className="text-xl font-bold mb-2 text-white">{trips.length === 0 ? 'Aucune course' : 'Aucun résultat'}</h3>
          <p style={{ color: '#94A3B8' }} className="mb-6">{trips.length === 0 ? 'Créez votre première réservation.' : 'Modifiez vos filtres.'}</p>
        </div>
      ) : filteredTrips.map(trip => (
        <motion.div key={trip.id} layout
          className="glass rounded-2xl p-5 group hover:border-white/20 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Date + Client */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center shrink-0"
                style={{ background: trip.tripType === 'disposal' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#0047AB,#1e40af)' }}>
                <span className="text-[10px] uppercase font-bold opacity-70 text-white">{format(new Date(trip.date), 'MMM')}</span>
                <span className="text-xl font-bold text-white">{format(new Date(trip.date), 'dd')}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white truncate">{trip.clientName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ background: trip.tripType === 'disposal' ? 'rgba(245,158,11,0.15)' : 'rgba(0,71,171,0.15)',
                      color: trip.tripType === 'disposal' ? '#f59e0b' : '#60a5fa' }}>
                    {trip.tripType === 'disposal' ? 'MAD' : 'Transfert'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ background: statusColors[trip.status]?.bg, color: statusColors[trip.status]?.text }}>
                    {statusColors[trip.status]?.label}
                  </span>
                  {trip.invoiceNumber && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1"
                      style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                      <Hash className="w-3 h-3" />{trip.invoiceNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs mt-1 flex-wrap" style={{ color: '#94A3B8' }}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trip.time}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {trip.passengerCount}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {trip.clientPhone}</span>
                  {trip.flightNumber && <span className="flex items-center gap-1" style={{ color: '#60a5fa' }}><Plane className="w-3 h-3" /> {trip.flightNumber}</span>}
                </div>
              </div>
            </div>

            {/* Center: Route */}
            <div className="flex-1 flex items-center gap-3 px-4 border-l border-white/10 text-sm min-w-0 hidden md:flex">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: '#60a5fa' }} />
              <span className="truncate max-w-[140px] text-white">{trip.pickUpLocation}</span>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
              <span className="truncate max-w-[140px] text-white">{trip.dropOffLocation || '—'}</span>
            </div>

            {/* Right: Price + Actions */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <span className="text-lg font-bold mr-2 text-white">{formatEUR(trip.price)}</span>

              {/* Status change actions */}
              {trip.status !== 'invoiced' && trip.status !== 'cancelled' && (
                <div className="flex gap-1">
                  {trip.status === 'scheduled' && (
                    <button onClick={() => changeStatus(trip.id, 'in_progress')} title="Démarrer"
                      className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20" style={{ color: '#22c55e' }}><Play className="w-4 h-4" /></button>
                  )}
                  {trip.status === 'in_progress' && (
                    <button onClick={() => changeStatus(trip.id, 'completed')} title="Terminer"
                      className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20" style={{ color: '#22c55e' }}><CheckCircle2 className="w-4 h-4" /></button>
                  )}
                  {(trip.status === 'scheduled' || trip.status === 'in_progress') && (
                    <button onClick={() => changeStatus(trip.id, 'cancelled')} title="Annuler"
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20" style={{ color: '#ef4444' }}><Ban className="w-4 h-4" /></button>
                  )}
                </div>
              )}

              <div className="w-px h-6 bg-white/10 mx-1"></div>

              <button onClick={() => navigate(`/sign/${trip.id}`)} title="Sign Aéroport"
                className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20" style={{ color: '#eab308' }}><Eye className="w-4 h-4" /></button>
              <button onClick={() => generateBon(trip)} title="Bon de Commande"
                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20" style={{ color: '#3b82f6' }}><FileText className="w-4 h-4" /></button>
              <button onClick={() => setSigTripId(trip.id)} title="Signer"
                className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20" style={{ color: '#6366f1' }}>
                {trip.signature ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <PenTool className="w-4 h-4" />}
              </button>
              {trip.tripType === 'disposal' && (
                <button onClick={() => generateMAD(trip)} title="Mise à Disposition"
                  className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20" style={{ color: '#f97316' }}><FolderOpen className="w-4 h-4" /></button>
              )}
              <button onClick={() => shareOnWhatsApp(trip)} title="Partager WhatsApp"
                className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20" style={{ color: '#22c55e' }}><MessageCircle className="w-4 h-4" /></button>
              {trip.status !== 'invoiced' && (
                <button onClick={() => invoiceTrip(trip)} title="Générer Facture"
                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20" style={{ color: '#22c55e' }}><Receipt className="w-4 h-4" /></button>
              )}

              {/* Delete with confirm */}
              {confirmDelete === trip.id ? (
                <div className="flex items-center gap-1 ml-1">
                  <button onClick={() => deleteTrip(trip.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">Oui</button>
                  <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg bg-white/10 text-white text-xs">Non</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(trip.id)} title="Supprimer"
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 ml-1" style={{ color: '#ef4444' }}><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          </div>
          {trip.notes && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2 text-xs" style={{ color: '#94A3B8' }}>
              <StickyNote className="w-3 h-3 mt-0.5 shrink-0" /> {trip.notes}
            </div>
          )}
        </motion.div>
      ))}

      <SignatureModal 
        isOpen={!!sigTripId} 
        onClose={() => setSigTripId(null)} 
        initialSignature={trips.find(t => t.id === sigTripId)?.signature}
        onSave={(data) => {
          if (sigTripId) {
            addSignature(sigTripId, data);
            setSigTripId(null);
          }
        }} 
      />
    </motion.div>
  );
}
