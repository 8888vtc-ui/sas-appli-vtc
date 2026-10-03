/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM — Charte "Cockpit"
   ───────────────────────────────────────────────────
   • Fond noir profond + surfaces neutres
   • Vert émeraude  : signature / rentabilité / action primaire
   • Bleu           : STRICTEMENT réservé au GPS / navigation
   • Ambre / Rouge  : STRICTEMENT réservés aux alertes
   ═══════════════════════════════════════════════════ */
export const theme = {
  bg: '#000000',
  surfaceLowest: '#0e0e0e',
  surface: '#161616',
  surfaceHigh: '#1f1f1f',
  surfaceHighest: '#2a2a2a',
  border: '#2c2c2c',

  text: '#f5f5f5',
  textMuted: '#b4b4b4', // ≈ 8:1 sur #161616 — lisible à bout de bras

  emerald: '#00ff87',
  onEmerald: '#00391c',
  emeraldSoft: 'rgba(0,255,135,0.12)',

  gps: '#0a6cff',
  onGps: '#ffffff',

  warning: '#ffb020',
  danger: '#ff453a',
} as const;

export type Theme = typeof theme;
