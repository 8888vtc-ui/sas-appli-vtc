import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════
   useLiveTraffic — État de la circulation géolocalisé
   ───────────────────────────────────────────────────
   1. Position : API Geolocation du navigateur
   2. Zone     : reverse-geocoding BigDataCloud (gratuit, sans clé)
   3. Météo    : Open-Meteo (gratuit, sans clé)
   4. Trafic   : TomTom Flow API si VITE_TOMTOM_API_KEY est défini,
                 sinon estimation (heure, jour, météo, saison touristique)
   ═══════════════════════════════════════════════════ */

export type TrafficLevel = 'fluide' | 'modere' | 'dense' | 'sature';

export interface TrafficState {
  status: 'loading' | 'ready' | 'denied' | 'error';
  zone: string;
  region?: string;
  lat?: number;
  lng?: number;
  level: TrafficLevel;
  source: 'live' | 'estimate';
  currentSpeed?: number;
  freeFlowSpeed?: number;
  temperature?: number;
  weatherLabel?: string;
  updatedAt?: number;
}

export const TRAFFIC_LEVELS: Record<TrafficLevel, { label: string; color: string; score: number }> = {
  fluide: { label: 'Fluide', color: '#00ff87', score: 1 },
  modere: { label: 'Modéré', color: '#ffd60a', score: 2 },
  dense:  { label: 'Dense',  color: '#ff9f0a', score: 3 },
  sature: { label: 'Saturé', color: '#ff453a', score: 4 },
};

const ORDER: TrafficLevel[] = ['fluide', 'modere', 'dense', 'sature'];
const REFRESH_MS = 5 * 60 * 1000;
const CACHE_KEY = 'vtc_last_position';
// Position de repli si la géolocalisation est refusée : Nice (Côte d'Azur)
const FALLBACK = { lat: 43.7102, lng: 7.262, zone: 'Nice', region: 'Alpes-Maritimes' };

const TOMTOM_KEY = (import.meta as any).env?.VITE_TOMTOM_API_KEY as string | undefined;

function weatherFromCode(code: number): { label: string; wet: boolean } {
  if (code === 0) return { label: 'Dégagé', wet: false };
  if (code <= 2) return { label: 'Peu nuageux', wet: false };
  if (code === 3) return { label: 'Couvert', wet: false };
  if (code === 45 || code === 48) return { label: 'Brouillard', wet: true };
  if (code >= 51 && code <= 57) return { label: 'Bruine', wet: true };
  if (code >= 61 && code <= 67) return { label: 'Pluie', wet: true };
  if (code >= 71 && code <= 77) return { label: 'Neige', wet: true };
  if (code >= 80 && code <= 82) return { label: 'Averses', wet: true };
  if (code >= 95) return { label: 'Orage', wet: true };
  return { label: 'Variable', wet: false };
}

/** Estimation de la densité de trafic quand aucune donnée temps réel n'est disponible. */
function estimateLevel(now: Date, wet: boolean, region?: string): TrafficLevel {
  const day = now.getDay(); // 0 = dimanche
  const h = now.getHours() + now.getMinutes() / 60;
  const weekday = day >= 1 && day <= 5;
  let idx = 0;

  if (weekday) {
    if ((h >= 7.5 && h < 9.5) || (h >= 16.5 && h < 19.5)) idx = 2;
    else if (h >= 6.5 && h < 21) idx = 1;
    if (h >= 17.5 && h < 18.75) idx = 3;
  } else if (day === 6) {
    if (h >= 10 && h < 19.5) idx = 1;
    if (h >= 15 && h < 18.5) idx = 2;
  } else {
    if (h >= 11 && h < 19) idx = 1;
  }

  // Saison touristique sur la Côte d'Azur / littoral méditerranéen (juin → août)
  const coastal = /alpes-maritimes|var|monaco|provence/i.test(region || '');
  const m = now.getMonth();
  if (coastal && m >= 5 && m <= 7 && h >= 9 && h < 21) idx += 1;
  if (wet) idx += 1;

  return ORDER[Math.min(idx, ORDER.length - 1)];
}

function levelFromSpeed(current: number, free: number): TrafficLevel {
  const r = free > 0 ? current / free : 1;
  if (r >= 0.85) return 'fluide';
  if (r >= 0.65) return 'modere';
  if (r >= 0.45) return 'dense';
  return 'sature';
}

function getPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: REFRESH_MS }
    );
  });
}

async function reverseGeocode(lat: number, lng: number): Promise<{ zone: string; region?: string }> {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`
  );
  if (!res.ok) throw new Error('geocode');
  const d = await res.json();
  const dept = d.localityInfo?.administrative?.find((a: any) => a.adminLevel === 6)?.name;
  return { zone: d.city || d.locality || dept || 'Zone actuelle', region: dept || d.principalSubdivision };
}

async function fetchWeather(lat: number, lng: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`
  );
  if (!res.ok) throw new Error('weather');
  const d = await res.json();
  return { temperature: Math.round(d.current?.temperature_2m), ...weatherFromCode(d.current?.weather_code ?? -1) };
}

async function fetchTomTom(lat: number, lng: number) {
  if (!TOMTOM_KEY) return null;
  const res = await fetch(
    `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&unit=KMPH&key=${TOMTOM_KEY}`
  );
  if (!res.ok) return null;
  const d = await res.json();
  const f = d.flowSegmentData;
  if (!f) return null;
  return { currentSpeed: f.currentSpeed as number, freeFlowSpeed: f.freeFlowSpeed as number };
}

export function useLiveTraffic() {
  const [state, setState] = useState<TrafficState>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached?.zone) return { ...cached, status: 'loading' };
    } catch { /* ignore */ }
    return { status: 'loading', zone: 'Localisation…', level: 'fluide', source: 'estimate' };
  });
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    let denied = false;
    let pos = { lat: FALLBACK.lat, lng: FALLBACK.lng };
    let place: { zone: string; region?: string } = { zone: FALLBACK.zone, region: FALLBACK.region };

    try {
      pos = await getPosition();
      place = await reverseGeocode(pos.lat, pos.lng).catch(() => ({ zone: 'Zone actuelle', region: undefined }));
    } catch {
      denied = true;
    }

    try {
      const [weather, flow] = await Promise.all([
        fetchWeather(pos.lat, pos.lng).catch(() => null),
        fetchTomTom(pos.lat, pos.lng).catch(() => null),
      ]);

      const level = flow
        ? levelFromSpeed(flow.currentSpeed, flow.freeFlowSpeed)
        : estimateLevel(new Date(), !!weather?.wet, place.region);

      const next: TrafficState = {
        status: denied ? 'denied' : 'ready',
        zone: place.zone,
        region: place.region,
        lat: pos.lat,
        lng: pos.lng,
        level,
        source: flow ? 'live' : 'estimate',
        currentSpeed: flow?.currentSpeed,
        freeFlowSpeed: flow?.freeFlowSpeed,
        temperature: weather?.temperature,
        weatherLabel: weather?.label,
        updatedAt: Date.now(),
      };
      setState(next);
      if (!denied) localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      setState(s => ({ ...s, status: 'error' }));
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { ...state, refresh };
}
