import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CalendarPlus } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

import SignatureModal from '../components/SignatureModal';
import GPSModal, { openNavigationApp } from '../components/GPSModal';
import { showToast } from '../components/Toast';
import TrafficWidget from '../components/dashboard/TrafficWidget';
import RevenueWidget from '../components/dashboard/RevenueWidget';
import NextTripCard from '../components/dashboard/NextTripCard';
import TripRow from '../components/dashboard/TripRow';
import { useApp } from '../context/AppContext';
import { useNow } from '../hooks/useNow';
import { theme as t } from '../lib/theme';
import { generateFacturePDF } from '../lib/quickInvoicePdf';
import type { Trip } from '../types';

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  return format(d, 'EEE d MMM', { locale: fr });
}

const tripTs = (tr: Trip) => new Date(`${tr.date}T${tr.time}`).getTime();

/* ═══════════════════════════════════════════════════
   DASHBOARD — Cockpit chauffeur
   Ordre de lecture terrain : 1. course active → 2. contexte (trafic / CA) → 3. liste
   ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { trips, changeStatus, invoiceTrip, generateBon, deleteTrip, addSignature, settings } = useApp();
  const now = useNow();

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sigTripId, setSigTripId] = useState<string | null>(null);
  const [gpsModal, setGpsModal] = useState<{ isOpen: boolean; destination: string; label: string; lat?: number; lng?: number } | null>(null);
  const [showSmsToast, setShowSmsToast] = useState(false);

  /* ─── Actions ─── */
  const triggerGPS = (destination: string, label: string, lat?: number, lng?: number) => {
    const preferred = localStorage.getItem('vtc_preferred_gps') as 'waze' | 'google' | 'apple' | null;
    if (preferred) openNavigationApp(destination, preferred, lat, lng);
    else setGpsModal({ isOpen: true, destination, label, lat, lng });
  };

  const navigateTo = (trip: Trip) => {
    const isDrop = trip.status === 'in_progress';
    const dest = isDrop ? (trip.dropOffLocation || trip.pickUpLocation) : trip.pickUpLocation;
    const lat = isDrop ? (trip.dropOffLat || trip.pickUpLat) : trip.pickUpLat;
    const lng = isDrop ? (trip.dropOffLng || trip.pickUpLng) : trip.pickUpLng;
    triggerGPS(dest, 'Navigation', lat, lng);
  };

  const handleStart = (trip: Trip) => {
    changeStatus(trip.id, 'in_progress');
    navigator.vibrate?.(30);
    showToast(`Course démarrée : ${trip.clientName}`, 'success');
  };

  const handleComplete = (trip: Trip) => {
    changeStatus(trip.id, 'completed');
    navigator.vibrate?.([20, 40, 20]);
    showToast(`Course terminée : ${trip.clientName}`, 'success');
  };

  const handleInvoice = (trip: Trip) => {
    invoiceTrip(trip);
    showToast(`Facture émise pour ${trip.clientName}`, 'success');
  };

  const handleDelete = (id: string) => {
    deleteTrip(id);
    setExpandedId(null);
    showToast('Course supprimée', 'info');
  };

  const shareWhatsApp = (trip: Trip) => {
    const text = `Bonjour ${trip.clientName}, confirmation de votre course le ${fmtDate(trip.date)} à ${trip.time}. Départ : ${trip.pickUpLocation}. Destination : ${trip.dropOffLocation || 'Mise à disposition'}. Tarif : ${trip.price} €. ${settings.companyName}`;
    const phone = (trip.clientPhone || '').replace(/[^0-9]/g, '');
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendArrivalSMS = (trip: Trip) => {
    setShowSmsToast(true);
    setTimeout(() => setShowSmsToast(false), 5000);
    const text = `Bonjour ${trip.clientName}, votre chauffeur VTC est arrivé au point de rendez-vous (${trip.pickUpLocation}). À tout de suite !`;
    const phone = (trip.clientPhone || '').replace(/[^0-9+]/g, '');
    window.open(phone ? `sms:${phone}?body=${encodeURIComponent(text)}` : `sms:?body=${encodeURIComponent(text)}`, '_self');
  };

  const trackFlight = (flightNumber: string) => {
    window.open(`https://www.google.com/search?q=vol+${flightNumber}`, '_blank');
  };

  /* ─── Données ─── */
  const nextTrip = useMemo(() => {
    const inProg = trips.find(tr => tr.status === 'in_progress');
    if (inProg) return inProg;
    return [...trips].filter(tr => tr.status === 'scheduled').sort((a, b) => tripTs(a) - tripTs(b))[0] || null;
  }, [trips]);

  const listTrips = useMemo(() => {
    const active = tab === 'active';
    return trips
      .filter(tr => active
        ? (tr.status === 'scheduled' || tr.status === 'in_progress') && tr.id !== nextTrip?.id
        : tr.status === 'completed' || tr.status === 'invoiced' || tr.status === 'cancelled')
      .sort((a, b) => (active ? tripTs(a) - tripTs(b) : tripTs(b) - tripTs(a)));
  }, [trips, tab, nextTrip]);

  const showHero = !!nextTrip;

  return (
    <div className="flex flex-col w-full gap-5 pb-6" style={{ color: t.text }}>
      <div className={showHero ? 'flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-6' : 'flex flex-col gap-5'}>

        {/* ─── 1. Course active / imminente (au-dessus de la ligne de flottaison) ─── */}
        {showHero && nextTrip && (
          <section className="lg:sticky lg:top-24" aria-label="Prochaine course">
            <NextTripCard
              trip={nextTrip}
              dateLabel={fmtDate(nextTrip.date)}
              onStart={() => handleStart(nextTrip)}
              onComplete={() => handleComplete(nextTrip)}
              onNavigate={() => navigateTo(nextTrip)}
              onSms={() => sendArrivalSMS(nextTrip)}
              onTrackFlight={() => nextTrip.flightNumber && trackFlight(nextTrip.flightNumber)}
            />
          </section>
        )}

        <div className="flex flex-col gap-5 min-w-0">
          {/* ─── 2. Contexte : trafic & CA ─── */}
          <section className={`grid grid-cols-1 gap-3 ${showHero ? 'sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : 'sm:grid-cols-2'}`}>
            <TrafficWidget />
            <RevenueWidget />
          </section>

          <AnimatePresence>
            {showSmsToast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="p-3 rounded-2xl flex items-center gap-2 text-sm font-semibold"
                style={{ backgroundColor: t.emerald, color: t.onEmerald }}
              >
                <CheckCircle2 className="w-5 h-5" /> SMS de courtoisie préparé !
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── 3. Liste des courses ─── */}
          <section className="flex flex-col gap-3" aria-label="Liste des courses">
            <div role="tablist" className="flex rounded-2xl p-1" style={{ backgroundColor: t.surface }}>
              {([
                { key: 'active', label: 'À venir' },
                { key: 'history', label: 'Historique' },
              ] as const).map(tb => (
                <button
                  key={tb.key}
                  id={`dashboard-tab-${tb.key}`}
                  role="tab"
                  aria-selected={tab === tb.key}
                  onClick={() => { setTab(tb.key); setExpandedId(null); }}
                  className="flex-1 min-h-[44px] rounded-xl text-sm font-bold uppercase tracking-wide transition-colors"
                  style={{
                    backgroundColor: tab === tb.key ? t.surfaceHighest : 'transparent',
                    color: tab === tb.key ? t.text : t.textMuted,
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold">{tab === 'active' ? (showHero ? 'Courses suivantes' : 'À venir') : 'Historique'}</h3>
              <span className="text-sm font-semibold" style={{ color: t.textMuted }}>{listTrips.length} course{listTrips.length > 1 ? 's' : ''}</span>
            </div>

            {listTrips.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-center py-10 rounded-2xl border border-dashed" style={{ borderColor: t.border, color: t.textMuted }}>
                <p className="text-base">{tab === 'active' ? 'Aucune autre course planifiée.' : 'Aucune course dans l’historique.'}</p>
                {tab === 'active' && (
                  <button
                    onClick={() => window.dispatchEvent(new Event('open-new-trip'))}
                    className="inline-flex items-center gap-2 px-4 min-h-[48px] rounded-xl text-sm font-bold"
                    style={{ backgroundColor: t.emeraldSoft, color: t.emerald }}
                  >
                    <CalendarPlus className="w-5 h-5" /> Nouveau trajet
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {listTrips.map(trip => (
                  <TripRow
                    key={trip.id}
                    trip={trip}
                    now={now}
                    dateLabel={fmtDate(trip.date)}
                    open={expandedId === trip.id}
                    onToggle={() => setExpandedId(expandedId === trip.id ? null : trip.id)}
                    onStart={() => handleStart(trip)}
                    onComplete={() => handleComplete(trip)}
                    onInvoice={() => handleInvoice(trip)}
                    onBon={() => generateBon(trip)}
                    onFacturePdf={() => generateFacturePDF(trip, settings)}
                    onWhatsApp={() => shareWhatsApp(trip)}
                    onSignature={() => setSigTripId(trip.id)}
                    onDelete={() => handleDelete(trip.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modales */}
      {gpsModal && <GPSModal isOpen={gpsModal.isOpen} onClose={() => setGpsModal(null)} destination={gpsModal.destination} lat={gpsModal.lat} lng={gpsModal.lng} tripLabel={gpsModal.label} />}
      <SignatureModal
        isOpen={!!sigTripId}
        onClose={() => setSigTripId(null)}
        initialSignature={trips.find(tr => tr.id === sigTripId)?.signature}
        onSave={data => { if (sigTripId) { addSignature(sigTripId, data); setSigTripId(null); } }}
      />
    </div>
  );
}
