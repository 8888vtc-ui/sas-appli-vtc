import { Play, CheckCircle2, Navigation, Phone, MessageCircle, Plane, Clock } from 'lucide-react';
import type { Trip } from '../../types';
import { formatEUR } from '../../lib/utils';
import { theme as t } from '../../lib/theme';
import { getCountdown } from '../../lib/countdown';
import { useNow } from '../../hooks/useNow';

interface Props {
  trip: Trip;
  dateLabel: string;
  onStart: () => void;
  onComplete: () => void;
  onNavigate: () => void;
  onSms: () => void;
  onTrackFlight: () => void;
}

/* Carte "Prochaine course" — bloc prioritaire du cockpit, toujours au-dessus de la ligne de flottaison */
export default function NextTripCard({ trip, dateLabel, onStart, onComplete, onNavigate, onSms, onTrackFlight }: Props) {
  const now = useNow();
  const cd = getCountdown(trip, now);
  const inProgress = trip.status === 'in_progress';

  return (
    <div className="flex flex-col gap-3">
      <article
        className="relative overflow-hidden rounded-3xl p-4 sm:p-5 border"
        style={{ backgroundColor: t.surface, borderColor: cd?.tone === 'late' ? `${t.danger}66` : t.border }}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: t.emeraldSoft }} />

        {/* Ligne 1 : compte à rebours + prix */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: t.textMuted }}>
              {inProgress ? 'Course en cours' : 'Prochaine course'}
            </span>
            {cd ? (
              <span
                className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-base font-extrabold ${cd.tone === 'late' || cd.tone === 'imminent' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: cd.bg, color: cd.color }}
              >
                <Clock className="w-4 h-4" /> {cd.label}
              </span>
            ) : (
              <span className="text-base font-bold" style={{ color: t.text }}>{dateLabel}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none" style={{ color: t.text }}>{formatEUR(trip.price)}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: t.textMuted }}>
              {dateLabel} · <span style={{ color: t.text }}>{trip.time}</span>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="relative mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: t.surfaceLowest }}>
          <h2 className="text-lg font-bold truncate" style={{ color: t.text }}>{trip.clientName}</h2>
          {trip.flightNumber && (
            <button
              onClick={onTrackFlight}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: t.surfaceHighest, color: t.text }}
            >
              <Plane className="w-4 h-4" /> {trip.flightNumber}
            </button>
          )}
        </div>

        {/* Itinéraire */}
        <div className="relative mt-4 flex flex-col gap-3">
          <RoutePoint label="Prise en charge" value={trip.pickUpLocation} dot={t.emerald} line />
          <RoutePoint label="Destination" value={trip.dropOffLocation || 'Mise à disposition'} dot={t.text} />
        </div>
      </article>

      {/* Actions tactiles — grandes cibles (≥ 56 px) */}
      {trip.status === 'scheduled' && (
        <button
          id="next-trip-start"
          onClick={onStart}
          className="w-full min-h-[60px] rounded-2xl flex items-center justify-center gap-3 font-extrabold text-lg uppercase tracking-wide active:scale-[0.98] transition-transform shadow-[0_0_24px_rgba(0,255,135,0.25)]"
          style={{ backgroundColor: t.emerald, color: t.onEmerald }}
        >
          <Play className="w-6 h-6" /> Démarrer la course
        </button>
      )}
      {inProgress && (
        <button
          id="next-trip-complete"
          onClick={onComplete}
          className="w-full min-h-[60px] rounded-2xl flex items-center justify-center gap-3 font-extrabold text-lg uppercase tracking-wide active:scale-[0.98] transition-transform"
          style={{ backgroundColor: t.text, color: t.bg }}
        >
          <CheckCircle2 className="w-6 h-6" /> Terminer la course
        </button>
      )}

      <div className="grid grid-cols-4 gap-3">
        <button
          id="next-trip-gps"
          onClick={onNavigate}
          className="col-span-2 min-h-[60px] rounded-2xl flex items-center justify-center gap-2 font-bold text-base active:scale-95 transition-transform"
          style={{ backgroundColor: t.gps, color: t.onGps }}
        >
          <Navigation className="w-5 h-5" /> GPS
        </button>
        <a
          id="next-trip-call"
          href={trip.clientPhone ? `tel:${trip.clientPhone}` : undefined}
          aria-disabled={!trip.clientPhone}
          className={`min-h-[60px] rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform ${trip.clientPhone ? '' : 'opacity-40 pointer-events-none'}`}
          style={{ backgroundColor: t.surfaceHigh, color: t.text }}
        >
          <Phone className="w-5 h-5" style={{ color: t.emerald }} />
          <span className="text-xs font-semibold">Appeler</span>
        </a>
        <button
          id="next-trip-sms"
          onClick={onSms}
          className="min-h-[60px] rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
          style={{ backgroundColor: t.surfaceHigh, color: t.text }}
        >
          <MessageCircle className="w-5 h-5" style={{ color: t.emerald }} />
          <span className="text-xs font-semibold">Arrivé</span>
        </button>
      </div>
    </div>
  );
}

function RoutePoint({ label, value, dot, line }: { label: string; value: string; dot: string; line?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1.5">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dot }} />
        {line && <span className="w-0.5 h-8 mt-1" style={{ backgroundColor: t.border }} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>{label}</p>
        <p className="text-base sm:text-lg font-semibold leading-snug line-clamp-2" style={{ color: t.text }}>{value}</p>
      </div>
    </div>
  );
}
