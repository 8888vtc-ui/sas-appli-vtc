import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, MapPin, X, Maximize2, Minimize2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import airportBg from '../assets/airport-bg.png';

export default function SignMode() {
  const { id } = useParams();
  const { trips, settings } = useApp();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const trip = trips.find(t => t.id === id);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-2">Course non trouvée</h1>
        <p className="text-slate-400 text-sm mb-6">L'identifiant de la course est invalide ou a été supprimé.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 md:p-12 text-white overflow-hidden select-none cursor-pointer"
      style={{
        backgroundColor: '#050B14',
        backgroundImage: `linear-gradient(rgba(5, 11, 20, 0.75), rgba(5, 11, 20, 0.85)), url(${airportBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => navigate('/')}
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-10">
        {/* Company Logo & Name */}
        <div className="flex items-center gap-3.5 glass px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
          <div
            className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-lg shadow-sm"
            style={{ borderColor: settings.logoColor || '#3B82F6', color: settings.logoColor || '#3B82F6' }}
          >
            {(settings.companyName || 'V')[0]}
          </div>
          <span className="font-bold tracking-wider uppercase text-sm sm:text-base text-white">
            {settings.companyName || 'VTC PRESTIGE'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}
            className="p-3 rounded-2xl glass hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            title="Quitter l'accueil aéroport"
            className="p-3 rounded-2xl glass hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </div>

      {/* Center Hero: Welcome Message & Giant Client Name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center my-auto px-4 max-w-6xl w-full"
      >
        <p className="text-xl sm:text-3xl md:text-4xl font-light tracking-[0.25em] mb-4 sm:mb-8 text-blue-300 uppercase">
          {settings.welcomeMessage || 'BIENVENUE / WELCOME'}
        </p>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] break-words leading-tight">
          {trip.clientName}
        </h1>

        {trip.flightNumber && (
          <div className="mt-6 sm:mt-10 inline-flex items-center gap-3 sm:gap-4 text-xl sm:text-3xl font-mono glass px-6 sm:px-10 py-3 sm:py-4 rounded-full border border-blue-400/30 text-white shadow-2xl">
            <Plane className="w-6 h-6 sm:w-8 h-8 text-blue-400 animate-pulse" />
            <span className="font-bold tracking-widest">{trip.flightNumber}</span>
          </div>
        )}
      </motion.div>

      {/* Bottom Info Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-300 glass px-6 py-3 rounded-2xl border border-white/10 z-10">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> {trip.date} • {trip.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> {trip.pickUpLocation}
          </span>
        </div>
        <p className="text-slate-400 text-[11px] italic">
          Touchez n'importe où sur l'écran pour revenir
        </p>
      </div>
    </motion.div>
  );
}
