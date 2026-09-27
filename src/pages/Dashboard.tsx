import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Play, CheckCircle2,
  FileText, Trash2, PenTool, MessageCircle,
  Plane, MoreHorizontal, Phone, Calendar, Search,
  Navigation
} from 'lucide-react';
import SignatureModal from '../components/SignatureModal';
import GPSModal, { openNavigationApp } from '../components/GPSModal';
import { showToast } from '../components/Toast';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS — iOS Dark Mode
   ═══════════════════════════════════════════════════ */
const c = {
  blue: '#0a84ff', green: '#30d158', orange: '#ff9f0a',
  red: '#ff453a', purple: '#bf5af2', cyan: '#64d2ff',
  gray: '#8e8e93', sep: 'rgba(84, 84, 88, 0.36)',
  card: '#1c1c1e', card2: '#2c2c2e',
};

const statusCfg: Record<string, { color: string; label: string }> = {
  scheduled:   { color: c.blue,   label: 'Planifiée' },
  in_progress: { color: c.orange, label: 'En cours' },
  completed:   { color: c.green,  label: 'Terminée' },
  cancelled:   { color: c.red,    label: 'Annulée' },
  invoiced:    { color: c.purple, label: 'Facturée' },
};

/* Date en français lisible */
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  return format(d, 'EEE d MMM', { locale: fr });
}

/* Style des boutons secondaires dans "Plus d'actions" */
const moreBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '11px 8px', borderRadius: 10, background: c.card2,
  color: '#fff', fontSize: 13, fontWeight: 500, border: 'none',
};

/* ═══════════════════════════════════════════════════
   DASHBOARD — Version Ultra Simplifiée & Intuitive
   ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { trips, changeStatus, invoiceTrip, generateBon, deleteTrip, addSignature, settings } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [moreId, setMoreId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sigTripId, setSigTripId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsModal, setGpsModal] = useState<{ isOpen: boolean; destination: string; label: string } | null>(null);

  const triggerGPS = (destination: string, label: string) => {
    const preferred = localStorage.getItem('vtc_preferred_gps') as 'waze' | 'google' | 'apple' | null;
    if (preferred) {
      openNavigationApp(destination, preferred);
    } else {
      setGpsModal({ isOpen: true, destination, label });
    }
  };

  const handleStart = (id: string, name: string) => {
    changeStatus(id, 'in_progress');
    showToast(`Course démarrée : ${name}`, 'success');
  };

  const handleComplete = (id: string, name: string) => {
    changeStatus(id, 'completed');
    showToast(`Course terminée : ${name}`, 'success');
  };

  const handleInvoice = (trip: any) => {
    invoiceTrip(trip);
    showToast(`Facture émise pour ${trip.clientName}`, 'success');
  };

  const handleDelete = (id: string) => {
    deleteTrip(id);
    setConfirmDelete(null);
    showToast('Course supprimée', 'info');
  };

  /* ── Prochaine course (en cours d'abord, sinon la plus proche planifiée) ── */
  const nextTrip = useMemo(() => {
    const inProg = trips.find(t => t.status === 'in_progress');
    if (inProg) return inProg;
    return trips
      .filter(t => t.status === 'scheduled')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0] || null;
  }, [trips]);

  /* ── Résumé du jour ── */
  const todayCount = useMemo(() => {
    const today = trips.filter(t => isToday(new Date(t.date + 'T00:00:00')));
    return { n: today.length, rev: today.reduce((s, t) => s + (t.price || 0), 0) };
  }, [trips]);

  /* ── Liste filtrée (sans la carte "prochaine course") ── */
  const listTrips = useMemo(() => {
    let list = trips;
    if (tab === 'active') list = list.filter(t => t.status === 'scheduled' || t.status === 'in_progress');
    else list = list.filter(t => t.status === 'completed' || t.status === 'invoiced' || t.status === 'cancelled');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.clientName.toLowerCase().includes(q) || t.pickUpLocation.toLowerCase().includes(q));
    }
    list = list.sort((a, b) => {
      const dA = new Date(a.date + 'T' + a.time).getTime(), dB = new Date(b.date + 'T' + b.time).getTime();
      return tab === 'active' ? dA - dB : dB - dA;
    });
    // En mode "À faire", on retire la prochaine course déjà affichée en carte
    if (tab === 'active' && nextTrip && !searchQuery) list = list.filter(t => t.id !== nextTrip.id);
    return list;
  }, [trips, tab, searchQuery, nextTrip]);

  const shareWhatsApp = (trip: any) => {
    const text = `Bonjour ${trip.clientName}, confirmation de votre course le ${fmtDate(trip.date)} à ${trip.time}. Départ : ${trip.pickUpLocation}. Destination : ${trip.dropOffLocation || 'Mise à disposition'}. Tarif : ${trip.price} €. ${settings.companyName}`;
    const phone = (trip.clientPhone || '').replace(/[^0-9]/g, '');
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>

      {/* ═══════════════════════════════════════════
           CARTE PROCHAINE COURSE (bien visible)
           ═══════════════════════════════════════════ */}
      {nextTrip && tab === 'active' && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: nextTrip.status === 'in_progress'
              ? 'linear-gradient(145deg, rgba(48,209,88,0.13), rgba(48,209,88,0.03))'
              : 'linear-gradient(145deg, rgba(10,132,255,0.13), rgba(10,132,255,0.03))',
            borderRadius: 20,
            padding: '16px',
            border: `1px solid ${nextTrip.status === 'in_progress' ? 'rgba(48,209,88,0.25)' : 'rgba(10,132,255,0.25)'}`,
          }}
        >
          {/* Étiquette */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4,
                background: nextTrip.status === 'in_progress' ? c.green : c.blue,
                boxShadow: `0 0 8px ${nextTrip.status === 'in_progress' ? c.green : c.blue}`,
                animation: nextTrip.status === 'in_progress' ? 'pulse 2s infinite' : 'none',
              }} />
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: nextTrip.status === 'in_progress' ? c.green : c.blue,
              }}>
                {nextTrip.status === 'in_progress' ? '🚗 Course en cours' : '📅 Prochaine course'}
              </span>
            </div>

            {nextTrip.flightNumber && (
              <button
                onClick={() => navigate(`/sign/${nextTrip.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 20, background: 'rgba(255, 159, 10, 0.15)',
                  border: '1px solid rgba(255, 159, 10, 0.3)', color: '#ff9f0a',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                <Plane style={{ width: 13, height: 13 }} /> Pancarte
              </button>
            )}
          </div>

          {/* Client + Prix */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>{nextTrip.clientName}</span>
            <span style={{ fontSize: 21, fontWeight: 800, color: '#fff', flexShrink: 0, marginLeft: 8 }}>
              {formatEUR(nextTrip.price)}
            </span>
          </div>

          {/* Quand */}
          <div style={{ fontSize: 14, color: '#ebebf5cc', marginBottom: 10 }}>
            {fmtDate(nextTrip.date)} à {nextTrip.time}
            {nextTrip.flightNumber && <span style={{ color: c.cyan, fontWeight: 600 }}> • ✈ {nextTrip.flightNumber}</span>}
          </div>

          {/* Trajet */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 14,
          }}>
            <MapPin style={{ width: 15, height: 15, color: c.blue, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#ebebf5cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {nextTrip.pickUpLocation}
            </span>
            <span style={{ color: '#48484a' }}>→</span>
            <span style={{ fontSize: 13, color: c.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'right' }}>
              {nextTrip.dropOffLocation || 'Mise à disposition'}
            </span>
          </div>

          {/* Boutons d'action Chauffeur 1-Tap */}
          <div style={{ display: 'flex', gap: 8 }}>
            {nextTrip.status === 'scheduled' && (
              <button onClick={() => handleStart(nextTrip.id, nextTrip.clientName)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 14, background: c.green, color: '#fff',
                fontSize: 15, fontWeight: 700, border: 'none',
                boxShadow: `0 4px 16px rgba(48,209,88,0.35)`,
              }}>
                <Play style={{ width: 18, height: 18, fill: 'rgba(255,255,255,0.3)' }} /> Démarrer
              </button>
            )}
            {nextTrip.status === 'in_progress' && (
              <button onClick={() => handleComplete(nextTrip.id, nextTrip.clientName)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 14, background: c.green, color: '#fff',
                fontSize: 15, fontWeight: 700, border: 'none',
                boxShadow: `0 4px 16px rgba(48,209,88,0.35)`,
              }}>
                <CheckCircle2 style={{ width: 18, height: 18, fill: 'rgba(255,255,255,0.3)' }} /> Terminer
              </button>
            )}

            {/* GPS 1-TAP (Waze / Maps) */}
            <button
              onClick={() => triggerGPS(
                nextTrip.status === 'in_progress' ? (nextTrip.dropOffLocation || nextTrip.pickUpLocation) : nextTrip.pickUpLocation,
                nextTrip.status === 'in_progress' ? `Destination: ${nextTrip.dropOffLocation}` : `Départ: ${nextTrip.pickUpLocation}`
              )}
              title="Lancer le GPS (Waze / Google Maps)"
              style={{
                width: 52, borderRadius: 14, background: 'rgba(10, 132, 255, 0.2)', border: '1px solid rgba(10, 132, 255, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Navigation style={{ width: 20, height: 20, color: '#0a84ff' }} />
            </button>

            {nextTrip.clientPhone && (
              <button onClick={() => window.open(`tel:${nextTrip.clientPhone}`)} style={{
                width: 50, borderRadius: 14, background: `${c.green}18`, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Phone style={{ width: 20, height: 20, color: c.green }} />
              </button>
            )}
            <button onClick={() => shareWhatsApp(nextTrip)} style={{
              width: 50, borderRadius: 14, background: `${c.green}18`, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MessageCircle style={{ width: 20, height: 20, color: c.green }} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════
           RÉSUMÉ + RECHERCHE (ligne compacte)
           ═══════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <span style={{ fontSize: 13, color: c.gray }}>
          Aujourd'hui : {todayCount.n} course{todayCount.n !== 1 ? 's' : ''} • {formatEUR(todayCount.rev)}
        </span>
        {trips.length > 4 && (
          <button onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
            style={{ width: 32, height: 32, borderRadius: 10, background: showSearch ? c.blue : c.card2, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search style={{ width: 15, height: 15, color: showSearch ? '#fff' : c.gray }} />
          </button>
        )}
      </div>

      {/* Barre de recherche (cachée par défaut) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <input autoFocus type="text" placeholder="Rechercher un client, un lieu..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: c.card2, border: 'none', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 15, boxSizing: 'border-box' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
           ONGLETS : À faire / Historique
           ═══════════════════════════════════════════ */}
      <div style={{ display: 'flex', background: c.card2, borderRadius: 10, padding: 3 }}>
        {([
          { key: 'active' as const, label: 'À faire' },
          { key: 'history' as const, label: 'Historique' },
        ]).map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); setExpandedId(null); setMoreId(null); }}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
              fontSize: 14, fontWeight: 600,
              background: tab === t.key ? c.card : 'transparent',
              color: tab === t.key ? '#fff' : c.gray, transition: 'all 0.2s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
           LISTE DES COURSES
           ═══════════════════════════════════════════ */}
      {listTrips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: c.card, borderRadius: 16, border: `0.5px solid ${c.sep}` }}>
          <Calendar style={{ width: 34, height: 34, color: '#48484a', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            {tab === 'active' ? 'Aucune course à venir' : 'Aucune course terminée'}
          </p>
          <p style={{ fontSize: 13, color: c.gray }}>
            {tab === 'active' ? 'Appuyez sur + pour créer une course' : ''}
          </p>
        </div>
      ) : (
        <div style={{ background: c.card, borderRadius: 16, overflow: 'hidden', border: `0.5px solid ${c.sep}` }}>
          {listTrips.map((trip, i) => {
            const st = statusCfg[trip.status];
            const isOpen = expandedId === trip.id;
            const showMore = moreId === trip.id;

            return (
              <div key={trip.id}>
                {i > 0 && <div style={{ height: 0.5, background: c.sep, marginLeft: 16 }} />}

                {/* ── Ligne de course ── */}
                <button
                  onClick={() => { setExpandedId(isOpen ? null : trip.id); setMoreId(null); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', background: isOpen ? 'rgba(10,132,255,0.05)' : 'transparent',
                    textAlign: 'left', border: 'none',
                  }}
                >
                  {/* Date compacte */}
                  <div style={{ width: 42, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                      {format(new Date(trip.date + 'T00:00:00'), 'd')}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: c.gray, textTransform: 'capitalize' }}>
                      {format(new Date(trip.date + 'T00:00:00'), 'MMM', { locale: fr })}
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {trip.clientName}
                    </div>
                    <div style={{ fontSize: 13, color: c.gray, marginTop: 2 }}>
                      {trip.time}
                      {trip.flightNumber && <span style={{ color: c.cyan }}> • ✈ {trip.flightNumber}</span>}
                    </div>
                  </div>

                  {/* Prix + Statut */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{formatEUR(trip.price)}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: `${st?.color}20`, color: st?.color,
                    }}>{st?.label}</span>
                  </div>
                </button>

                {/* ── Détail expandé ── */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 16px 14px' }}>
                        {/* Trajet */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 12px', background: c.card2, borderRadius: 10, marginBottom: 10, fontSize: 13,
                        }}>
                          <MapPin style={{ width: 14, height: 14, color: c.blue, flexShrink: 0 }} />
                          <span style={{ color: '#ebebf5cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {trip.pickUpLocation}
                          </span>
                          <span style={{ color: '#48484a' }}>→</span>
                          <span style={{ color: c.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'right' }}>
                            {trip.dropOffLocation || 'Mise à dispo.'}
                          </span>
                        </div>

                        {/* 3 actions max : Principale + WhatsApp + ⋯ */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                          {trip.status === 'scheduled' && (
                            <button onClick={() => handleStart(trip.id, trip.clientName)} style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '12px', borderRadius: 12, background: c.green, color: '#fff',
                              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                            }}><Play style={{ width: 16, height: 16 }} /> Démarrer</button>
                          )}
                          {trip.status === 'in_progress' && (
                            <button onClick={() => handleComplete(trip.id, trip.clientName)} style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '12px', borderRadius: 12, background: c.green, color: '#fff',
                              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                            }}><CheckCircle2 style={{ width: 16, height: 16 }} /> Terminer</button>
                          )}
                          {trip.status === 'completed' && (
                            <button onClick={() => handleInvoice(trip)} style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '12px', borderRadius: 12, background: c.blue, color: '#fff',
                              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                            }}><FileText style={{ width: 16, height: 16 }} /> Facturer</button>
                          )}
                          {(trip.status === 'invoiced' || trip.status === 'cancelled') && (
                            <button onClick={() => generateBon(trip)} style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '12px', borderRadius: 12, background: `${c.blue}18`, color: c.blue,
                              fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                            }}><FileText style={{ width: 16, height: 16 }} /> Bon VTC</button>
                          )}

                          {/* GPS 1-Tap */}
                          <button
                            onClick={() => triggerGPS(
                              trip.status === 'in_progress' ? (trip.dropOffLocation || trip.pickUpLocation) : trip.pickUpLocation,
                              trip.status === 'in_progress' ? `Destination: ${trip.dropOffLocation}` : `Départ: ${trip.pickUpLocation}`
                            )}
                            title="Lancer le GPS"
                            style={{
                              width: 48, borderRadius: 12, background: 'rgba(10, 132, 255, 0.15)', border: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                          >
                            <Navigation style={{ width: 18, height: 18, color: '#0a84ff' }} />
                          </button>

                          <button onClick={() => shareWhatsApp(trip)} style={{
                            width: 48, borderRadius: 12, background: `${c.green}18`, border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}><MessageCircle style={{ width: 18, height: 18, color: c.green }} /></button>

                          <button onClick={() => setMoreId(showMore ? null : trip.id)} style={{
                            width: 48, borderRadius: 12, background: showMore ? '#3a3a3c' : `${c.gray}15`, border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}><MoreHorizontal style={{ width: 18, height: 18, color: c.gray }} /></button>
                        </div>

                        {/* ⋯ Plus d'actions (caché par défaut) */}
                        <AnimatePresence>
                          {showMore && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
                                <button onClick={() => generateBon(trip)} style={moreBtn}>
                                  <FileText style={{ width: 15, height: 15, color: c.blue }} /> Bon VTC
                                </button>
                                <button onClick={() => setSigTripId(trip.id)} style={moreBtn}>
                                  <PenTool style={{ width: 15, height: 15, color: c.purple }} />
                                  {trip.signature ? '✓ Signé' : 'Signature'}
                                </button>
                                <button onClick={() => navigate(`/sign/${trip.id}`)} style={moreBtn}>
                                  <Plane style={{ width: 15, height: 15, color: c.orange }} /> Aéroport
                                </button>
                                {confirmDelete === trip.id ? (
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => handleDelete(trip.id)} style={{
                                      flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                                      background: c.red, color: '#fff', fontSize: 13, fontWeight: 700,
                                    }}>Oui</button>
                                    <button onClick={() => setConfirmDelete(null)} style={{
                                      flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                                      background: c.card2, color: '#fff', fontSize: 13, fontWeight: 500,
                                    }}>Non</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDelete(trip.id)} style={{ ...moreBtn, color: c.red }}>
                                    <Trash2 style={{ width: 15, height: 15, color: c.red }} /> Supprimer
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {trip.notes && (
                          <p style={{ marginTop: 8, fontSize: 12, color: c.gray, fontStyle: 'italic' }}>{trip.notes}</p>
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

      {/* Modale Navigation GPS */}
      {gpsModal && (
        <GPSModal
          isOpen={gpsModal.isOpen}
          onClose={() => setGpsModal(null)}
          destination={gpsModal.destination}
          tripLabel={gpsModal.label}
        />
      )}

      {/* Modale Signature */}
      <SignatureModal
        isOpen={!!sigTripId}
        onClose={() => setSigTripId(null)}
        initialSignature={trips.find(t => t.id === sigTripId)?.signature}
        onSave={data => { if (sigTripId) { addSignature(sigTripId, data); setSigTripId(null); } }}
      />
    </div>
  );
}
