import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle2,
  FileText, Trash2, PenTool, MessageCircle,
  MoreHorizontal, Phone,
  Navigation, Car, Banknote, Map, Sparkles
} from 'lucide-react';
import SignatureModal from '../components/SignatureModal';
import GPSModal, { openNavigationApp } from '../components/GPSModal';
import { showToast } from '../components/Toast';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';
import { jsPDF } from 'jspdf';

const generateFacturePDF = (trip: any, settings: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE VTC', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`N° Facture : F-${new Date().getFullYear()}-${trip.id.substring(0,6).toUpperCase()}`, pageWidth - 14, 26, { align: 'right' });

  // Société
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'Mon Entreprise VTC', 14, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.companyAddress || '', 14, 46);
  doc.text(`SIRET : ${settings.siret || 'N/A'}`, 14, 52);
  doc.text(`TVA : ${settings.tvaNumber || 'N/A'}`, 14, 58);

  // Client
  doc.setFont('helvetica', 'bold');
  doc.text('Client :', pageWidth - 80, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(trip.clientName || 'Client', pageWidth - 80, 46);
  
  // Détails
  doc.setFont('helvetica', 'bold');
  doc.text('Détails de la prestation', 14, 80);
  doc.line(14, 82, pageWidth - 14, 82);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date de course : ${trip.date}`, 14, 90);
  doc.text(`Départ : ${trip.pickUpLocation}`, 14, 96);
  doc.text(`Arrivée : ${trip.dropOffLocation || 'Mise à disposition'}`, 14, 102);

  // Totaux
  const tvaRate = settings.tvaRegime === 'assujetti' ? (settings.tvaRate || 10) : 0;
  const priceTTC = trip.price || 0;
  const priceHT = priceTTC / (1 + (tvaRate / 100));
  const tvaAmount = priceTTC - priceHT;

  doc.line(14, 120, pageWidth - 14, 120);
  doc.text('Total HT :', pageWidth - 60, 130);
  doc.text(formatEUR(priceHT), pageWidth - 14, 130, { align: 'right' });
  
  doc.text(`TVA (${tvaRate}%) :`, pageWidth - 60, 138);
  doc.text(formatEUR(tvaAmount), pageWidth - 14, 138, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC :', pageWidth - 60, 148);
  doc.text(formatEUR(priceTTC), pageWidth - 14, 148, { align: 'right' });

  // Mentions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const mention = settings.tvaRegime === 'franchise' ? 'TVA non applicable, art. 293 B du CGI.' : 'TVA acquittée sur les encaissements.';
  doc.text(mention, pageWidth / 2, 280, { align: 'center' });

  doc.save(`Facture_${trip.clientName.replace(/\s+/g, '_')}_${trip.date}.pdf`);
};

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS — Mapping Charte Graphique
   ═══════════════════════════════════════════════════ */
const c = {
  surface: '#131313',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#b9cbb9',
  primary: '#f1ffef',
  primaryContainer: '#00ff87',
  onPrimaryContainer: '#007138',
  secondaryContainer: '#0566d9',
  onSecondaryContainer: '#e6ecff',
  tertiaryFixedDim: '#ffb95f',
  outlineVariant: '#3b4b3d',
  red: '#ff453a',
  purple: '#bf5af2',
};

const statusCfg: Record<string, { color: string; label: string }> = {
  scheduled:   { color: '#00ff87', label: 'Garantie' },
  in_progress: { color: '#ffb95f', label: 'En cours' },
  completed:   { color: '#0566d9', label: 'Terminée' },
  cancelled:   { color: '#ff453a', label: 'Annulée' },
  invoiced:    { color: '#bf5af2', label: 'Facturée' },
};

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  return format(d, 'EEE d MMM', { locale: fr });
}

const moreBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '11px 8px', borderRadius: 10, background: c.surfaceContainerHigh,
  color: c.onSurface, fontSize: 13, fontWeight: 500, border: 'none',
};

/* ═══════════════════════════════════════════════════
   DASHBOARD — Nouveau Cockpit Accueil Chauffeur
   ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { trips, changeStatus, invoiceTrip, generateBon, deleteTrip, addSignature, settings } = useApp();

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [moreId, setMoreId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sigTripId, setSigTripId] = useState<string | null>(null);
  const [gpsModal, setGpsModal] = useState<{ isOpen: boolean; destination: string; label: string; lat?: number; lng?: number } | null>(null);
  const [showSmsToast, setShowSmsToast] = useState(false);

  const triggerGPS = (destination: string, label: string, lat?: number, lng?: number) => {
    const preferred = localStorage.getItem('vtc_preferred_gps') as 'waze' | 'google' | 'apple' | null;
    if (preferred) {
      openNavigationApp(destination, preferred, lat, lng);
    } else {
      setGpsModal({ isOpen: true, destination, label, lat, lng });
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

  const shareWhatsApp = (trip: any) => {
    const text = `Bonjour ${trip.clientName}, confirmation de votre course le ${fmtDate(trip.date)} à ${trip.time}. Départ : ${trip.pickUpLocation}. Destination : ${trip.dropOffLocation || 'Mise à disposition'}. Tarif : ${trip.price} €. ${settings.companyName}`;
    const phone = (trip.clientPhone || '').replace(/[^0-9]/g, '');
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendArrivalSMS = (trip: any) => {
    setShowSmsToast(true);
    setTimeout(() => setShowSmsToast(false), 5000);
    const text = `Bonjour ${trip.clientName}, votre chauffeur VTC est arrivé au point de rendez-vous (${trip.pickUpLocation}). À tout de suite !`;
    const phone = (trip.clientPhone || '').replace(/[^0-9+]/g, '');
    window.open(phone ? `sms:${phone}?body=${encodeURIComponent(text)}` : `sms:?body=${encodeURIComponent(text)}`, '_self');
  };

  const trackFlight = (flightNumber: string) => {
    window.open(`https://www.google.com/search?q=vol+${flightNumber}`, '_blank');
  };

  const nextTrip = useMemo(() => {
    const inProg = trips.find(t => t.status === 'in_progress');
    if (inProg) return inProg;
    return trips
      .filter(t => t.status === 'scheduled')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0] || null;
  }, [trips]);

  const todayCount = useMemo(() => {
    const today = trips.filter(t => isToday(new Date(t.date + 'T00:00:00')));
    return { n: today.length, rev: today.reduce((s, t) => s + (t.price || 0), 0) };
  }, [trips]);

  const listTrips = useMemo(() => {
    let list = trips;
    if (tab === 'active') list = list.filter(t => t.status === 'scheduled' || t.status === 'in_progress');
    else list = list.filter(t => t.status === 'completed' || t.status === 'invoiced' || t.status === 'cancelled');
    list = list.sort((a, b) => {
      const dA = new Date(a.date + 'T' + a.time).getTime(), dB = new Date(b.date + 'T' + b.time).getTime();
      return tab === 'active' ? dA - dB : dB - dA;
    });
    return list;
  }, [trips, tab]);

  return (
    <div className="flex flex-col w-full gap-4 pb-24 text-[#e5e2e1]">
      
      {/* ─── HUD Telemetry Bar: Live Traffic & Daily Revenue ─── */}
      <section className="grid grid-cols-2 gap-3 w-full">
        {/* Live Traffic */}
        <div className="flex items-center gap-3 p-3 rounded-xl shadow-md" style={{ backgroundColor: c.surfaceContainerHigh }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: c.surfaceContainer, color: '#60ff98' }}>
            <Map className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: c.primaryContainer }}></span>
              <span className="text-[11px] font-bold uppercase tracking-wide truncate" style={{ color: c.primary }}>Trafic Paris</span>
            </div>
            <span className="text-[13px] font-normal truncate" style={{ color: c.onSurfaceVariant }}>Fluide • 14°C Sec</span>
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="flex items-center gap-3 p-3 rounded-xl shadow-md" style={{ backgroundColor: c.surfaceContainerHigh }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: c.surfaceContainer, color: c.primaryContainer }}>
            <Banknote className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: c.onSurfaceVariant }}>Recette du Jour</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] sm:text-[22px] font-bold tracking-tight" style={{ color: c.primary }}>{formatEUR(todayCount.rev)}</span>
              <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>· {todayCount.n} course(s)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Co-Pilot AI Tactical Alert ─── */}
      <aside className="w-full rounded-xl p-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: c.surfaceContainerLow }}>
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="w-5 h-5 shrink-0" style={{ color: '#adc6ff' }} />
          <p className="text-[13px] font-normal truncate" style={{ color: c.onSurface }}>
            {nextTrip ? `Prochaine course pour ${nextTrip.clientName} prévue à ${nextTrip.time}.` : "Aucune course imminente. Bonne route !"}
          </p>
        </div>
        <span className="text-[11px] font-medium shrink-0 ml-2" style={{ color: '#d8e2ff' }}>Copilot</span>
      </aside>

      {/* ─── MAJOR HERO CARD: Next Ride VIP ─── */}
      {nextTrip && tab === 'active' && (
        <>
          <article className="relative flex flex-col w-full rounded-xl p-4 shadow-xl overflow-hidden" style={{ backgroundColor: c.surfaceContainerHigh }}>
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${c.primaryContainer}1a` }}></div>
            
            {/* Header Encart */}
            <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-[0_0_16px_rgba(0,255,135,0.35)]" style={{ backgroundColor: c.primaryContainer, color: c.onPrimaryContainer }}>
                <Car className="w-4 h-4" />
                <span className="text-[13px] font-bold uppercase tracking-wider">{nextTrip.status === 'in_progress' ? 'EN COURS' : 'PROCHAIN DÉPART'}</span>
              </div>
              <div className="text-right">
                <div className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-none" style={{ color: c.primary }}>{formatEUR(nextTrip.price)}</div>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.tertiaryFixedDim }}>
                  {nextTrip.flightNumber ? `VOL ${nextTrip.flightNumber}` : 'Prestation'}
                </span>
              </div>
            </div>

            {/* Client Profile Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl shadow-inner mb-4 relative z-10" style={{ backgroundColor: c.surfaceContainerLowest }}>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[16px] font-bold truncate" style={{ color: c.onSurface }}>{nextTrip.clientName}</h2>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-normal" style={{ color: c.onSurfaceVariant }}>
                  <span>{fmtDate(nextTrip.date)} à {nextTrip.time}</span>
                </div>
              </div>
              {nextTrip.flightNumber && (
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <button onClick={() => trackFlight(nextTrip.flightNumber!)} className="px-3 py-1 rounded-full text-[11px] font-bold uppercase" style={{ backgroundColor: '#2a2a2a', color: '#adc6ff' }}>
                    Suivre le vol
                  </button>
                </div>
              )}
            </div>

            {/* Route Overview */}
            <div className="flex flex-col gap-3 relative z-10 mb-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_rgba(0,255,135,0.6)]" style={{ backgroundColor: c.primaryContainer }}></div>
                  <div className="w-0.5 h-7 my-0.5" style={{ backgroundColor: c.outlineVariant }}></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.onSurfaceVariant }}>Prise en charge</span>
                  <span className="text-[15px] sm:text-[17px] font-normal truncate" style={{ color: c.onSurface }}>{nextTrip.pickUpLocation}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_rgba(5,102,217,0.6)]" style={{ backgroundColor: c.secondaryContainer }}></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.onSurfaceVariant }}>Destination</span>
                  <span className="text-[15px] sm:text-[17px] font-normal truncate" style={{ color: c.primary }}>{nextTrip.dropOffLocation || 'Mise à disposition'}</span>
                </div>
              </div>
            </div>
          </article>

          {/* ─── Large Tactile Driver Controls ─── */}
          <section className="flex flex-col gap-3 w-full">
            {/* Nav Start or Complete */}
            {nextTrip.status === 'scheduled' && (
              <button onClick={() => handleStart(nextTrip.id, nextTrip.clientName)} className="w-full min-h-[56px] py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(48,209,88,0.4)] active:scale-[0.98]" style={{ backgroundColor: '#00ff87', color: '#007138' }}>
                <Play className="w-7 h-7" />
                <span className="text-[16px] font-bold uppercase tracking-wide">Démarrer la course</span>
              </button>
            )}
            {nextTrip.status === 'in_progress' && (
              <button onClick={() => handleComplete(nextTrip.id, nextTrip.clientName)} className="w-full min-h-[56px] py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,159,10,0.4)] active:scale-[0.98]" style={{ backgroundColor: '#ffb95f', color: '#653e00' }}>
                <CheckCircle2 className="w-7 h-7" />
                <span className="text-[16px] font-bold uppercase tracking-wide">Terminer la course</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Giant Waze Button */}
              <button 
                onClick={() => {
                  const isDrop = nextTrip.status === 'in_progress';
                  const dest = isDrop ? (nextTrip.dropOffLocation || nextTrip.pickUpLocation) : nextTrip.pickUpLocation;
                  const lat = isDrop ? (nextTrip.dropOffLat || nextTrip.pickUpLat) : nextTrip.pickUpLat;
                  const lng = isDrop ? (nextTrip.dropOffLng || nextTrip.pickUpLng) : nextTrip.pickUpLng;
                  triggerGPS(dest, 'Navigation', lat, lng);
                }}
                className="col-span-2 sm:col-span-1 min-h-[56px] py-3 px-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(5,102,217,0.4)] active:scale-95 transition-all"
                style={{ backgroundColor: c.secondaryContainer, color: c.onSecondaryContainer }}
              >
                <Navigation className="w-6 h-6" />
                <span className="text-[15px] font-bold uppercase tracking-wide">GPS Waze / Maps</span>
              </button>

              <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-3">
                {/* Call Passenger */}
                <a href={nextTrip.clientPhone ? `tel:${nextTrip.clientPhone}` : '#'} className="min-h-[56px] py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all" style={{ backgroundColor: c.surfaceContainerHigh, color: c.onSurface }}>
                  <Phone className="w-5 h-5" style={{ color: c.primaryContainer }} />
                  <span className="text-[12px] font-medium">Appeler</span>
                </a>
                
                {/* Quick SMS */}
                <button onClick={() => sendArrivalSMS(nextTrip)} className="min-h-[56px] py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all" style={{ backgroundColor: c.surfaceContainerHigh, color: c.onSurface }}>
                  <MessageCircle className="w-5 h-5" style={{ color: '#adc6ff' }} />
                  <span className="text-[12px] font-medium text-center leading-tight">SMS "Arrivé"</span>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── Interactive Feedback Pill ─── */}
      <AnimatePresence>
        {showSmsToast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full p-3 rounded-xl flex items-center justify-between shadow-lg" style={{ backgroundColor: c.primaryContainer, color: c.onPrimaryContainer }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[13px] font-medium">SMS de courtoisie préparé !</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Onglets ─── */}
      <div className="flex rounded-xl p-1 mt-2" style={{ backgroundColor: c.surfaceContainerHigh }}>
        {[
          { key: 'active' as const, label: 'À VENIR' },
          { key: 'history' as const, label: 'HISTORIQUE' },
        ].map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); setExpandedId(null); setMoreId(null); }}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all"
            style={{
              backgroundColor: tab === t.key ? c.surfaceContainerLowest : 'transparent',
              color: tab === t.key ? c.primary : c.onSurfaceVariant,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Upcoming Missions Today ─── */}
      <section className="flex flex-col gap-3 w-full mt-2">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[18px] font-semibold tracking-tight" style={{ color: c.primary }}>
            {tab === 'active' ? 'Courses Suivantes' : 'Historique'}
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.onSurfaceVariant }}>
            {listTrips.length} Course(s)
          </span>
        </div>

        {listTrips.length === 0 ? (
          <div className="text-center py-10" style={{ color: c.onSurfaceVariant }}>
            <p>Aucune course pour le moment.</p>
          </div>
        ) : (
          listTrips.map(trip => {
            const st = statusCfg[trip.status];
            const isOpen = expandedId === trip.id;
            const showMore = moreId === trip.id;

            return (
              <div key={trip.id} className="flex flex-col gap-2">
                <article 
                  onClick={() => { setExpandedId(isOpen ? null : trip.id); setMoreId(null); }}
                  className="flex items-center justify-between p-3 rounded-xl shadow-sm cursor-pointer transition-all"
                  style={{ backgroundColor: isOpen ? c.surfaceContainerHigh : c.surfaceContainer, border: isOpen ? `1px solid ${c.outlineVariant}` : '1px solid transparent' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 text-center" style={{ backgroundColor: c.surfaceContainerHigh }}>
                      <span className="text-[10px] font-bold uppercase" style={{ color: '#adc6ff' }}>Heure</span>
                      <span className="text-[15px] font-bold" style={{ color: c.primary }}>{trip.time}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-bold truncate" style={{ color: c.onSurface }}>{trip.clientName}</span>
                      <span className="text-[12px] font-normal truncate" style={{ color: c.onSurfaceVariant }}>{trip.pickUpLocation}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-[15px] font-bold" style={{ color: c.primary }}>{formatEUR(trip.price)}</span>
                    <span className="text-[10px] font-bold uppercase mt-0.5" style={{ color: st?.color || '#00ff87' }}>
                      {st?.label || 'Planifiée'}
                    </span>
                  </div>
                </article>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-3 rounded-xl mb-2 flex flex-col gap-2" style={{ backgroundColor: c.surfaceContainerLowest }}>
                        <div className="flex gap-2">
                          {trip.status === 'scheduled' && (
                            <>
                              <button onClick={() => generateBon(trip)} className="w-12 rounded-lg flex items-center justify-center border" style={{ borderColor: c.outlineVariant, backgroundColor: c.surfaceContainer }}><FileText className="w-5 h-5" style={{ color: c.secondaryContainer }}/></button>
                              <button onClick={() => handleStart(trip.id, trip.clientName)} className="flex-1 py-3 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2" style={{ backgroundColor: '#00ff87', color: '#007138' }}><Play className="w-4 h-4"/> Démarrer</button>
                            </>
                          )}
                          {trip.status === 'in_progress' && (
                            <button onClick={() => handleComplete(trip.id, trip.clientName)} className="flex-1 py-3 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2" style={{ backgroundColor: '#ffb95f', color: '#653e00' }}><CheckCircle2 className="w-4 h-4"/> Terminer</button>
                          )}
                          {trip.status === 'completed' && (
                            <button onClick={() => handleInvoice(trip)} className="flex-1 py-3 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2" style={{ backgroundColor: '#0566d9', color: '#fff' }}><FileText className="w-4 h-4"/> Facturer</button>
                          )}
                          
                          <button onClick={() => shareWhatsApp(trip)} className="w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primaryContainer}22` }}><MessageCircle className="w-5 h-5" style={{ color: c.primaryContainer }}/></button>
                          <button onClick={() => setMoreId(showMore ? null : trip.id)} className="w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.surfaceContainerHigh }}><MoreHorizontal className="w-5 h-5" style={{ color: c.onSurface }}/></button>
                        </div>

                        <AnimatePresence>
                          {showMore && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <button onClick={() => generateBon(trip)} style={moreBtn}><FileText className="w-4 h-4" style={{ color: c.secondaryContainer }}/> Bon VTC</button>
                                <button onClick={() => setSigTripId(trip.id)} style={moreBtn}><PenTool className="w-4 h-4" style={{ color: c.purple }}/> Signature</button>
                                {confirmDelete === trip.id ? (
                                  <div className="col-span-2 flex gap-2">
                                    <button onClick={() => handleDelete(trip.id)} className="flex-1 py-2 rounded-lg font-bold text-[13px]" style={{ backgroundColor: c.red, color: '#fff' }}>Confirmer</button>
                                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg font-bold text-[13px]" style={{ backgroundColor: c.surfaceContainerHigh, color: '#fff' }}>Annuler</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDelete(trip.id)} className="col-span-2 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[13px] font-bold" style={{ backgroundColor: `${c.red}22`, color: c.red }}><Trash2 className="w-4 h-4"/> Supprimer la course</button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {(trip.status === 'completed' || trip.status === 'invoiced') && (
                          <button onClick={() => generateFacturePDF(trip, settings)} className="w-full py-3 mt-1 rounded-lg flex items-center justify-center gap-2 font-bold text-[14px]" style={{ backgroundColor: '#2563eb', color: '#fff' }}>
                            <FileText className="w-5 h-5" /> Générer la Facture PDF
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </section>

      {/* Modales */}
      {gpsModal && <GPSModal isOpen={gpsModal.isOpen} onClose={() => setGpsModal(null)} destination={gpsModal.destination} lat={gpsModal.lat} lng={gpsModal.lng} tripLabel={gpsModal.label} />}
      <SignatureModal isOpen={!!sigTripId} onClose={() => setSigTripId(null)} initialSignature={trips.find(t => t.id === sigTripId)?.signature} onSave={data => { if (sigTripId) { addSignature(sigTripId, data); setSigTripId(null); } }} />
    </div>
  );
}
