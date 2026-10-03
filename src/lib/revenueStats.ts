import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Trip, Expense } from '../types';

/* ═══════════════════════════════════════════════════
   Statistiques de chiffre d'affaires — partagées entre
   le Cockpit (Dashboard) et la page Chiffre d'affaires.
   CA réalisé = courses terminées ou facturées.
   CA prévu   = courses planifiées ou en cours.
   ═══════════════════════════════════════════════════ */

export interface PeriodStat { amount: number; count: number }

export interface RevenueStats {
  today: PeriodStat & { planned: number; plannedCount: number };
  week: PeriodStat & { prev: number; delta: number | null };
  month: PeriodStat & { prev: number; delta: number | null; expenses: number; net: number };
  avgTicket: number;
  upcoming: PeriodStat;
  cancelRate: number;
  last7Days: { key: string; label: string; amount: number; count: number; isToday: boolean }[];
  bestDay: { label: string; amount: number } | null;
}

const tripTime = (t: Trip) => new Date(`${t.date}T${t.time || '00:00'}`).getTime();
const isRealized = (t: Trip) => t.status === 'completed' || t.status === 'invoiced';
const isPlanned = (t: Trip) => t.status === 'scheduled' || t.status === 'in_progress';

function sum(trips: Trip[], from: number, to: number, pred: (t: Trip) => boolean): PeriodStat {
  let amount = 0, count = 0;
  for (const t of trips) {
    const ts = tripTime(t);
    if (ts >= from && ts <= to && pred(t)) { amount += t.price || 0; count++; }
  }
  return { amount, count };
}

const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

export function computeRevenueStats(trips: Trip[], expenses: Expense[] = [], now = new Date()): RevenueStats {
  const nowTs = now.getTime();
  const dayStart = startOfDay(now).getTime();
  const dayEnd = endOfDay(now).getTime();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const monthStart = startOfMonth(now).getTime();

  const today = sum(trips, dayStart, dayEnd, isRealized);
  const todayPlanned = sum(trips, dayStart, dayEnd, isPlanned);

  // Comparaisons à période équivalente (ex : lundi→jeudi vs lundi→jeudi précédent)
  const week = sum(trips, weekStart, dayEnd, isRealized);
  const prevWeek = sum(trips, subWeeks(new Date(weekStart), 1).getTime(), subWeeks(now, 1).getTime(), isRealized);

  const month = sum(trips, monthStart, dayEnd, isRealized);
  const prevMonth = sum(trips, subMonths(new Date(monthStart), 1).getTime(), subMonths(now, 1).getTime(), isRealized);

  const monthExpenses = expenses.reduce((acc, e) => {
    const ts = new Date(e.date).getTime();
    return ts >= monthStart && ts <= dayEnd ? acc + Number(e.amount || 0) : acc;
  }, 0);

  const upcoming = sum(trips, nowTs, Number.MAX_SAFE_INTEGER, isPlanned);

  const monthAll = trips.filter(t => { const ts = tripTime(t); return ts >= monthStart && ts <= dayEnd; });
  const cancelled = monthAll.filter(t => t.status === 'cancelled').length;

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(now, 6 - i);
    const s = sum(trips, startOfDay(d).getTime(), endOfDay(d).getTime(), isRealized);
    return {
      key: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE', { locale: fr }).replace('.', ''),
      amount: s.amount,
      count: s.count,
      isToday: i === 6,
    };
  });
  const best = last7Days.reduce((b, d) => (d.amount > (b?.amount ?? 0) ? d : b), null as null | typeof last7Days[number]);

  return {
    today: { ...today, planned: todayPlanned.amount, plannedCount: todayPlanned.count },
    week: { ...week, prev: prevWeek.amount, delta: pct(week.amount, prevWeek.amount) },
    month: {
      ...month,
      prev: prevMonth.amount,
      delta: pct(month.amount, prevMonth.amount),
      expenses: monthExpenses,
      net: month.amount - monthExpenses,
    },
    avgTicket: month.count ? month.amount / month.count : 0,
    upcoming,
    cancelRate: monthAll.length ? (cancelled / monthAll.length) * 100 : 0,
    last7Days,
    bestDay: best ? { label: best.label, amount: best.amount } : null,
  };
}
