import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Clock, MapPin, X, Maximize2, Minimize2, Edit3,
  Sun, Type, Lock, Unlock, ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import airportBg from '../assets/airport-bg.png';

export default function SignMode() {
  const { id } = useParams();
  const { trips, settings } = useApp();
  const navigate = useNavigate();

  const trip = trips.find(t => t.id === id);

  // État du texte affiché (pré-rempli par la course ou modifiable à la volée)
  const [clientName, setClientName] = useState(trip?.clientName || 'M. / MME DUPONT');
  const [flightNumber, setFlightNumber] = useState(trip?.flightNumber || '');
  const [welcomeText, setWelcomeText] = useState(settings.welcomeMessage || 'BIENVENUE / WELCOME');
  const [companyName, setCompanyName] = useState(settings.companyName || 'VTC PRESTIGE');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [themeMode, setThemeMode] = useState<'gold' | 'blue' | 'white' | 'contrast'>('gold');

  // Mettre à jour si la course est chargée de manière asynchrone
  useEffect(() => {
    if (trip) {
      setClientName(trip.clientName);
      if (trip.flightNumber) setFlightNumber(trip.flightNumber);
    }
  }, [trip]);

  // ─── Wake Lock API : Empêche l'iPhone / Android de se mettre en veille ───
  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock non supporté ou refusé:', err);
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release().catch(() => {});
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // ─── Plein Écran compatible iPhone iOS & Android ───
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      const isFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isFs) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(!isFullscreen);
    }
  };

  // Thèmes de couleurs
  const getThemeStyles = () => {
    switch (themeMode) {
      case 'gold':
        return {
          textColor: '#FBBF24', // Amber-400
          textShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
          badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
          accentColor: '#F59E0B',
        };
      case 'blue':
        return {
          textColor: '#60A5FA', // Blue-400
          textShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
          badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
          accentColor: '#3B82F6',
        };
      case 'contrast':
        return {
          textColor: '#000000',
          textShadow: 'none',
          badgeColor: 'border-black text-black bg-black/10',
          accentColor: '#000000',
        };
      case 'white':
      default:
        return {
          textColor: '#FFFFFF',
          textShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
          badgeColor: 'border-white/40 text-white bg-white/10',
          accentColor: '#FFFFFF',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden"
      style={{
        backgroundColor: themeMode === 'contrast' ? '#FFFFFF' : '#050B14',
        backgroundImage:
          themeMode === 'contrast'
            ? 'none'
            : `linear-gradient(rgba(5, 11, 20, 0.82), rgba(5, 11, 20, 0.92)), url(${airportBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
        paddingLeft: 'max(env(safe-area-inset-left, 16px), 16px)',
        paddingRight: 'max(env(safe-area-inset-right, 16px), 16px)',
      }}
    >
      {/* ══════════ TOP BAR ══════════ */}
      <div className="w-full flex items-center justify-between z-20 gap-2">
        {/* Logo / Société */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-md ${
            themeMode === 'contrast'
              ? 'bg-slate-100 border-slate-300 text-slate-900'
              : 'bg-white/5 border-white/10 text-white'
          }`}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{
              background: theme.accentColor,
              color: themeMode === 'contrast' ? '#FFFFFF' : '#000000',
            }}
          >
            {companyName[0]?.toUpperCase() || 'V'}
          </div>
          <span className="font-bold tracking-wider uppercase text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">
            {companyName}
          </span>
        </div>

        {/* Contrôles Chauffeur */}
        <div className="flex items-center gap-1.5">
          {/* Bouton Verrouillage Écran (Empêche toute fermeture accidentelle) */}
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? 'Déverrouiller les contrôles' : 'Verrouiller pour l’accueil'}
            className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md transition-all ${
              isLocked
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/30'
                : themeMode === 'contrast'
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white/10 border-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {!isLocked && (
            <>
              {/* Thèmes de couleur */}
              <div
                className={`flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-md ${
                  themeMode === 'contrast' ? 'bg-slate-100 border-slate-300' : 'bg-white/10 border-white/10'
                }`}
              >
                {(['gold', 'blue', 'white', 'contrast'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setThemeMode(t)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                      themeMode === t ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background:
                        t === 'gold' ? '#F59E0B' : t === 'blue' ? '#3B82F6' : t === 'white' ? '#E2E8F0' : '#000000',
                      color: t === 'contrast' ? '#FFFFFF' : '#000000',
                    }}
                  >
                    {t === 'contrast' ? 'B' : t[0].toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Modifier le texte */}
              <button
                type="button"
                onClick={() => setShowEditor(!showEditor)}
                title="Modifier le nom à la volée"
                className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md transition-all ${
                  themeMode === 'contrast'
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white/10 border-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Plein Écran */}
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
                className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md transition-all ${
                  themeMode === 'contrast'
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white/10 border-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Quitter */}
              <button
                type="button"
                onClick={() => navigate('/')}
                title="Retour au Dashboard"
                className="p-2.5 sm:p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold transition-all flex items-center gap-1 text-xs"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══════════ MODALE ÉDITEUR EXPRESS À LA VOLÉE ══════════ */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-30 my-2 mx-auto w-full max-w-xl bg-slate-900/95 border border-white/20 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" />
                Modifier l'affichage à la volée
              </h3>
              <button onClick={() => setShowEditor(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nom du Passager</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white font-bold outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">N° de Vol / Train (Optionnel)</label>
                <input
                  type="text"
                  placeholder="ex: AF1234"
                  value={flightNumber}
                  onChange={e => setFlightNumber(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Message d'accueil</label>
                <input
                  type="text"
                  value={welcomeText}
                  onChange={e => setWelcomeText(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Nom Société</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <button
              onClick={() => setShowEditor(false)}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs transition-all"
            >
              Appliquer sur le panneau
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ GRAND PANNEAU CENTRAL (VISIBLE À 25 MÈTRES) ══════════ */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center my-auto px-2 sm:px-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-center"
      >
        {/* Accroche Bienvenue */}
        <p
          className="text-sm sm:text-2xl md:text-3xl font-medium tracking-[0.3em] uppercase mb-2 sm:mb-6"
          style={{
            color: themeMode === 'contrast' ? '#475569' : '#94A3B8',
          }}
        >
          {welcomeText}
        </p>

        {/* NOM GÉANT DU PASSAGER */}
        <h1
          className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight break-words leading-[1.05] max-w-full"
          style={{
            color: theme.textColor,
            textShadow: theme.textShadow,
          }}
        >
          {clientName || 'PASSAGER'}
        </h1>

        {/* BADGE NUMÉRO DE VOL / TRAIN */}
        {flightNumber && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`mt-4 sm:mt-8 inline-flex items-center gap-2.5 sm:gap-4 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full border-2 shadow-2xl backdrop-blur-xl ${theme.badgeColor}`}
          >
            <Plane className="w-5 h-5 sm:w-7 sm:h-7 animate-pulse" />
            <span className="font-mono font-bold tracking-widest text-base sm:text-2xl">{flightNumber}</span>
          </motion.div>
        )}
      </motion.div>

      {/* ══════════ BOTTOM STATUS BAR ══════════ */}
      <div
        className={`w-full flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-2.5 rounded-2xl border backdrop-blur-md text-xs sm:text-sm z-20 ${
          themeMode === 'contrast'
            ? 'bg-slate-100 border-slate-300 text-slate-700'
            : 'bg-white/5 border-white/10 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {trip ? (
            <>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {trip.date} • {trip.time}
              </span>
              <span className="flex items-center gap-1.5 font-medium truncate max-w-[200px] sm:max-w-none">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {trip.pickUpLocation}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Mode Accueil Chauffeur Dédié
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Écran verrouillé (Touchez le cadenas en haut à droite pour quitter)
            </span>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Retour aux courses
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
