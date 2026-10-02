import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, ExternalLink, MapPin } from 'lucide-react';

interface GPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  lat?: number;
  lng?: number;
  tripLabel?: string;
}

export function openNavigationApp(address: string, app: 'waze' | 'google' | 'apple', lat?: number, lng?: number) {
  let url = '';
  if (lat !== undefined && lng !== undefined) {
    if (app === 'waze') {
      url = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else if (app === 'google') {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else if (app === 'apple') {
      url = `https://maps.apple.com/?daddr=${lat},${lng}`;
    }
  } else {
    const encoded = encodeURIComponent(address);
    if (app === 'waze') {
      url = `https://www.waze.com/ul?q=${encoded}&navigate=yes`;
    } else if (app === 'google') {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    } else if (app === 'apple') {
      url = `https://maps.apple.com/?daddr=${encoded}`;
    }
  }
  window.open(url, '_blank');
}

export default function GPSModal({ isOpen, onClose, destination, lat, lng, tripLabel }: GPSModalProps) {
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const handleLaunch = (app: 'waze' | 'google' | 'apple') => {
    if (saveAsDefault) {
      localStorage.setItem('vtc_preferred_gps', app);
    }
    openNavigationApp(destination, app, lat, lng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 0 max(env(safe-area-inset-bottom, 16px), 16px)',
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 480,
            background: '#1c1c1e',
            border: '1px solid rgba(84, 84, 88, 0.4)',
            borderRadius: 24,
            padding: 20,
            color: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(10, 132, 255, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Navigation style={{ width: 22, height: 22, color: '#0a84ff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Lancer le guidage GPS</h3>
                <p style={{ fontSize: 13, color: '#8e8e93', margin: 0 }}>{tripLabel || 'Navigation immédiate'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 16,
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Destination Preview */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <MapPin style={{ width: 18, height: 18, color: '#0a84ff', flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#ebebf5', wordBreak: 'break-word' }}>
              {destination || 'Destination non spécifiée'}
            </span>
          </div>

          {/* GPS App Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Waze */}
            <button
              onClick={() => handleLaunch('waze')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(51, 204, 255, 0.18), rgba(51, 204, 255, 0.06))',
                border: '1px solid rgba(51, 204, 255, 0.35)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🚙</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#33ccff' }}>Waze</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Trafic en temps réel & alertes Boers/Police</div>
                </div>
              </div>
              <ExternalLink style={{ width: 18, height: 18, color: '#33ccff' }} />
            </button>

            {/* Google Maps */}
            <button
              onClick={() => handleLaunch('google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.18), rgba(48, 209, 88, 0.06))',
                border: '1px solid rgba(48, 209, 88, 0.35)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🗺️</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#30d158' }}>Google Maps</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Itinéraire précis & vue satellite</div>
                </div>
              </div>
              <ExternalLink style={{ width: 18, height: 18, color: '#30d158' }} />
            </button>

            {/* Apple Maps */}
            <button
              onClick={() => handleLaunch('apple')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🍏</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Plans (Apple Maps)</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Intégration native iOS & CarPlay</div>
                </div>
              </div>
              <ExternalLink style={{ width: 18, height: 18, color: '#8e8e93' }} />
            </button>
          </div>

          {/* Mémoriser le choix */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
            <input
              type="checkbox"
              id="pref-gps"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#0a84ff', cursor: 'pointer' }}
            />
            <label htmlFor="pref-gps" style={{ fontSize: 12, color: '#8e8e93', cursor: 'pointer' }}>
              Mémoriser comme application de guidage par défaut
            </label>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
