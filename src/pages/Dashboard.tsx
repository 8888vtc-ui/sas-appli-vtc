import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Plane, Search,
  ChevronRight, Play, CheckCircle2,
  FileText, Trash2, PenTool, MessageCircle
} from 'lucide-react';
import SignatureModal from '../components/SignatureModal';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';

/* ═══════════════════════════════════════════════════
   DASHBOARD — Apple Finance / Wallet Style
   ═══════════════════════════════════════════════════ */

// iOS-style colors
const colors = {
  blue: '#0a84ff',
  green: '#30d158',
  orange: '#ff9f0a',
  red: '#ff453a',
  purple: '#bf5af2',
  cyan: '#64d2ff',
  yellow: '#ffd60a',
  gray: '#8e8e93',
  separator: 'rgba(84, 84, 88, 0.36)',
  elevated: '#1c1c1e',
  secondary: '#2c2c2e',
};

const statusMap: Record<string, { color: string; label: string }> = {
  scheduled: { color: colors.blue, label: 'Planifiée' },
  in_progress: { color: colors.orange, label: 'En cours' },
  completed: { color: colors.green, label: 'Terminée' },
  cancelled: { color: colors.red, label: 'Annulée' },
  invoiced: { color: colors.purple, label: 'Facturée' },
};

export default function Dashboard() {
  const { trips, stats, changeStatus, invoiceTrip, generateBon, deleteTrip, addSignature, settings } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sigTripId, setSigTripId] = useState<string | null>(null);

  const shareOnWhatsApp = (trip: any) => {
    const text = `Bonjour ${trip.clientName}, confirmation de votre course VTC le ${trip.date} à ${trip.time}. Départ: ${trip.pickUpLocation}. Destination: ${trip.dropOffLocation || 'Mise à disposition'}. Tarif: ${trip.price}€. ${settings.companyName}`;
    const phone = (trip.clientPhone || '').replace(/[^0-9]/g, '');
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filtered = trips
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t =>
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.pickUpLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.dropOffLocation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.flightNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const chips = [
    { key: 'all', label: 'Toutes' },
    { key: 'scheduled', label: 'Planifiées' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'completed', label: 'Terminées' },
    { key: 'invoiced', label: 'Facturées' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ═══════ STATS — Apple Wallet Style ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {([
          { label: "Aujourd'hui", amount: stats.todayRevenue, count: stats.todayCount, accent: colors.green },
          { label: 'Semaine', amount: stats.weekRevenue, count: stats.weekCount, accent: colors.blue },
          { label: 'Mois', amount: stats.monthRevenue, count: stats.monthCount, accent: colors.purple },
        ] as const).map(s => (
          <div key={s.label} className="animate-slide-up" style={{
            background: colors.elevated,
            borderRadius: 16,
            padding: '14px 12px',
            border: `0.5px solid ${colors.separator}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: colors.gray, marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              {formatEUR(s.amount)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: s.accent }} />
              <span style={{ fontSize: 11, color: colors.gray }}>
                {s.count} course{s.count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ SEARCH BAR ═══════ */}
      <div style={{ position: 'relative' }}>
        <Search style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          width: 16, height: 16, color: colors.gray,
        }} />
        <input
          type="text"
          placeholder="Rechercher une course..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: colors.secondary,
            border: 'none',
            borderRadius: 12,
            padding: '11px 12px 11px 38px',
            color: '#fff',
            fontSize: 15,
          }}
        />
      </div>

      {/* ═══════ FILTER CHIPS ═══════ */}
      <div style={{
        display: 'flex', gap: 6,
        overflowX: 'auto',
        paddingBottom: 2,
        scrollbarWidth: 'none',
      }}>
        {chips.map(c => (
          <button key={c.key}
            onClick={() => setStatusFilter(c.key)}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: statusFilter === c.key ? colors.blue : colors.secondary,
              color: statusFilter === c.key ? '#fff' : colors.gray,
              border: 'none',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* ═══════ TRIP LIST ═══════ */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: colors.elevated,
          borderRadius: 16,
          border: `0.5px solid ${colors.separator}`,
        }}>
          <Calendar style={{ width: 40, height: 40, color: '#48484a', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            {trips.length === 0 ? 'Aucune course' : 'Aucun résultat'}
          </p>
          <p style={{ fontSize: 13, color: colors.gray }}>
            {trips.length === 0 ? 'Appuyez sur + pour créer une course' : 'Essayez d\'autres filtres'}
          </p>
        </div>
      ) : (
        <div style={{
          background: colors.elevated,
          borderRadius: 16,
          overflow: 'hidden',
          border: `0.5px solid ${colors.separator}`,
        }}>
          {filtered.map((trip, i) => {
            const st = statusMap[trip.status];
            const isOpen = expandedId === trip.id;

            return (
              <div key={trip.id}>
                {/* Separator */}
                {i > 0 && <div style={{ height: 0.5, background: colors.separator, marginLeft: 64 }} />}

                {/* Row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : trip.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: isOpen ? 'rgba(10, 132, 255, 0.06)' : 'transparent',
                    textAlign: 'left',
                    minHeight: 60,
                  }}>

                  {/* Date badge */}
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: 10,
                    background: trip.tripType === 'disposal' ? 'rgba(255, 159, 10, 0.15)' : 'rgba(10, 132, 255, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      color: trip.tripType === 'disposal' ? colors.orange : colors.blue,
                      lineHeight: 1,
                    }}>
                      {format(new Date(trip.date), 'MMM')}
                    </span>
                    <span style={{
                      fontSize: 16, fontWeight: 800, lineHeight: 1.1,
                      color: trip.tripType === 'disposal' ? colors.orange : colors.blue,
                    }}>
                      {format(new Date(trip.date), 'dd')}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {trip.clientName}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: `${st?.color}20`,
                        color: st?.color,
                        flexShrink: 0,
                      }}>
                        {st?.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Clock style={{ width: 12, height: 12, color: colors.gray }} />
                      <span style={{ fontSize: 13, color: colors.gray }}>{trip.time}</span>
                      {trip.flightNumber && (
                        <>
                          <span style={{ color: '#48484a' }}>·</span>
                          <Plane style={{ width: 11, height: 11, color: colors.cyan }} />
                          <span style={{ fontSize: 12, color: colors.cyan, fontWeight: 600 }}>{trip.flightNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {formatEUR(trip.price)}
                  </span>
                </button>

                {/* ── EXPANDED ACTIONS ── */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 16px 14px' }}>

                        {/* Trajet */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 0 12px',
                          fontSize: 13, color: '#ebebf5cc',
                        }}>
                          <MapPin style={{ width: 14, height: 14, color: colors.blue, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {trip.pickUpLocation}
                          </span>
                          <ChevronRight style={{ width: 12, height: 12, color: '#48484a', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.gray }}>
                            {trip.dropOffLocation || 'MAD'}
                          </span>
                        </div>

                        {/* Action buttons — iOS grouped style */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 6,
                        }}>
                          {/* Status action */}
                          {trip.status === 'scheduled' && (
                            <ActionBtn icon={Play} label="Démarrer" color={colors.green}
                              onClick={() => changeStatus(trip.id, 'in_progress')} />
                          )}
                          {trip.status === 'in_progress' && (
                            <ActionBtn icon={CheckCircle2} label="Terminer" color={colors.green} solid
                              onClick={() => changeStatus(trip.id, 'completed')} />
                          )}

                          <ActionBtn icon={Plane} label="Aéroport" color={colors.orange}
                            onClick={() => navigate(`/sign/${trip.id}`)} />
                          <ActionBtn icon={FileText} label="Bon VTC" color={colors.blue}
                            onClick={() => generateBon(trip)} />
                          <ActionBtn icon={PenTool} label={trip.signature ? '✓ Signé' : 'Signer'} color={colors.purple}
                            onClick={() => setSigTripId(trip.id)} />
                          <ActionBtn icon={MessageCircle} label="WhatsApp" color={colors.green}
                            onClick={() => shareOnWhatsApp(trip)} />

                          {trip.status !== 'invoiced' ? (
                            <ActionBtn icon={FileText} label="Facturer" color={colors.cyan}
                              onClick={() => invoiceTrip(trip)} />
                          ) : confirmDelete === trip.id ? (
                            <div style={{ display: 'flex', gap: 4, gridColumn: 'span 1' }}>
                              <button onClick={() => deleteTrip(trip.id)} style={{
                                flex: 1, padding: '8px 0', borderRadius: 10,
                                background: colors.red, color: '#fff', fontSize: 12, fontWeight: 700,
                              }}>Oui</button>
                              <button onClick={() => setConfirmDelete(null)} style={{
                                flex: 1, padding: '8px 0', borderRadius: 10,
                                background: colors.secondary, color: '#fff', fontSize: 12, fontWeight: 500,
                              }}>Non</button>
                            </div>
                          ) : (
                            <ActionBtn icon={Trash2} label="Supprimer" color={colors.red}
                              onClick={() => setConfirmDelete(trip.id)} />
                          )}
                        </div>

                        {trip.notes && (
                          <p style={{ marginTop: 8, fontSize: 12, color: colors.gray, fontStyle: 'italic' }}>
                            {trip.notes}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

/* ═══════════════════════════════════════════════════
   ACTION BUTTON — iOS Compact Style
   ═══════════════════════════════════════════════════ */
function ActionBtn({ icon: Icon, label, color, onClick, solid }:
  { icon: any; label: string; color: string; onClick: () => void; solid?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '10px 4px',
      borderRadius: 12,
      background: solid ? color : `${color}15`,
      border: 'none',
      minHeight: 52,
      justifyContent: 'center',
    }}>
      <Icon style={{ width: 18, height: 18, color: solid ? '#fff' : color }} />
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: solid ? '#fff' : color,
        letterSpacing: '-0.01em',
      }}>
        {label}
      </span>
    </button>
  );
}
