import { MapPin, RefreshCw, CloudSun, Gauge, Navigation2 } from 'lucide-react';
import { useLiveTraffic, TRAFFIC_LEVELS } from '../../hooks/useLiveTraffic';

/* Carte "Trafic local" — zone détectée par géolocalisation */
export default function TrafficWidget() {
  const t = useLiveTraffic();
  const lvl = TRAFFIC_LEVELS[t.level];
  const loading = t.status === 'loading';

  const openLiveMap = () => {
    if (t.lat == null || t.lng == null) return;
    window.open(
      `https://www.google.com/maps/@?api=1&map_action=map&center=${t.lat},${t.lng}&zoom=13&layer=traffic`,
      '_blank'
    );
  };

  const updated = t.updatedAt
    ? new Date(t.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      id="traffic-widget"
      onClick={openLiveMap}
      onKeyDown={e => e.key === 'Enter' && openLiveMap()}
      className="group relative overflow-hidden rounded-2xl p-4 bg-[#161616] border border-white/5 hover:border-white/10 transition-all cursor-pointer active:scale-[0.99]"
    >
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-25 transition-colors"
        style={{ backgroundColor: lvl.color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#0e0e0e]">
            <MapPin className="w-5 h-5" style={{ color: lvl.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#b4b4b4]">Trafic local</p>
            <p className={`text-[16px] font-bold text-white truncate ${loading ? 'animate-pulse' : ''}`}>
              {t.zone}
              {t.region && t.region !== t.zone && (
                <span className="font-normal text-[#b4b4b4]"> · {t.region}</span>
              )}
            </p>
          </div>
        </div>

        <button
          id="traffic-refresh"
          aria-label="Actualiser le trafic"
          onClick={e => { e.stopPropagation(); t.refresh(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/5 hover:bg-white/10 text-[#b4b4b4]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold"
          style={{ backgroundColor: `${lvl.color}1f`, color: lvl.color }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: lvl.color }} />
          {lvl.label}
        </span>

        {/* Jauge 4 segments */}
        <div className="flex gap-1" aria-hidden>
          {[1, 2, 3, 4].map(i => (
            <span
              key={i}
              className="w-4 h-1.5 rounded-full"
              style={{ backgroundColor: i <= lvl.score ? lvl.color : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>

        {t.temperature != null && (
          <span className="inline-flex items-center gap-1 text-[12px] text-[#b4b4b4]">
            <CloudSun className="w-3.5 h-3.5" /> {t.temperature}°C · {t.weatherLabel}
          </span>
        )}
        {t.currentSpeed != null && (
          <span className="inline-flex items-center gap-1 text-[12px] text-[#b4b4b4]">
            <Gauge className="w-3.5 h-3.5" /> {t.currentSpeed} km/h
          </span>
        )}
      </div>

      <div className="relative mt-2 flex items-center justify-between text-xs text-[#b4b4b4]/70">
        <span>
          {t.status === 'denied'
            ? 'Localisation désactivée · zone par défaut'
            : t.source === 'live' ? 'Temps réel' : 'Estimation selon heure & météo'}
          {updated && ` · ${updated}`}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Navigation2 className="w-3 h-3" /> Carte trafic
        </span>
      </div>
    </div>
  );
}
