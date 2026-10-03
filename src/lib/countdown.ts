import type { Trip } from '../types';
import { theme } from '../lib/theme';

export type CountdownTone = 'live' | 'late' | 'imminent' | 'soon' | 'later';

export interface Countdown {
  label: string;
  tone: CountdownTone;
  color: string;
  bg: string;
  minutes: number;
}

const TONES: Record<CountdownTone, { color: string; bg: string }> = {
  live:     { color: theme.onEmerald, bg: theme.emerald },
  late:     { color: '#ffffff',       bg: theme.danger },
  imminent: { color: '#1a1000',       bg: theme.warning },
  soon:     { color: theme.emerald,   bg: theme.emeraldSoft },
  later:    { color: theme.textMuted, bg: 'rgba(255,255,255,0.06)' },
};

function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

/**
 * Badge temporel d'une course.
 *  • En cours           → "En cours · 12 min"
 *  • Passé l'heure      → "En retard de 4 min"   (rouge)
 *  • ≤ 15 min           → "Imminent · 8 min"      (ambre)
 *  • < 24 h             → "Dans 2 h 15"           (émeraude)
 *  • au-delà            → null (afficher la date)
 */
export function getCountdown(trip: Pick<Trip, 'date' | 'time' | 'status'>, now: number): Countdown | null {
  const start = new Date(`${trip.date}T${trip.time || '00:00'}`).getTime();
  if (Number.isNaN(start)) return null;
  const diff = Math.round((start - now) / 60_000);

  const make = (label: string, tone: CountdownTone): Countdown => ({ label, tone, minutes: diff, ...TONES[tone] });

  if (trip.status === 'in_progress') return make(diff < 0 ? `En cours · ${fmtDuration(-diff)}` : 'En cours', 'live');
  if (trip.status !== 'scheduled') return null;
  if (diff < -1) return make(`En retard de ${fmtDuration(-diff)}`, 'late');
  if (diff <= 1) return make('Maintenant', 'imminent');
  if (diff <= 15) return make(`Imminent · ${diff} min`, 'imminent');
  if (diff < 24 * 60) return make(`Dans ${fmtDuration(diff)}`, diff <= 60 ? 'soon' : 'later');
  return null;
}
