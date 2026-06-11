import { motion } from 'framer-motion';
import { Plane, Clock, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import airportBg from '../assets/airport-bg.png';

export default function SignMode() {
  const { id } = useParams();
  const { trips, settings } = useApp();
  const navigate = useNavigate();

  const trip = trips.find(t => t.id === id);

  if (!trip) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold">Course non trouvée</h1>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-white/10 rounded-xl">Retour</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-white overflow-hidden cursor-pointer"
      style={{ background: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${airportBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      onClick={() => navigate('/')}>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center" style={{ borderColor: settings.logoColor }}>
          <span className="font-bold text-2xl" style={{ color: settings.logoColor }}>{(settings.companyName || 'V')[0]}</span>
        </div>
        <span className="font-semibold tracking-widest uppercase text-2xl">{settings.companyName}</span>
      </div>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
        <h2 className="text-3xl md:text-5xl font-light tracking-widest mb-12 opacity-80">{settings.welcomeMessage}</h2>
        <h1 className="text-6xl md:text-9xl font-bold uppercase tracking-tight">{trip.clientName}</h1>
        {trip.flightNumber && (
          <div className="mt-12 flex items-center justify-center gap-4 text-2xl md:text-4xl opacity-90 glass px-8 py-4 rounded-full">
            <Plane className="w-8 h-8" /><span className="font-mono">{trip.flightNumber}</span>
          </div>
        )}
        <div className="mt-8 flex items-center justify-center gap-6 text-lg opacity-60">
          <span className="flex items-center gap-2"><Clock className="w-5 h-5" />{trip.time}</span>
          <span className="flex items-center gap-2"><MapPin className="w-5 h-5" />{trip.pickUpLocation}</span>
        </div>
      </motion.div>
      <div className="absolute bottom-8 text-sm opacity-50 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Cliquez n'importe où pour revenir
      </div>
    </motion.div>
  );
}
