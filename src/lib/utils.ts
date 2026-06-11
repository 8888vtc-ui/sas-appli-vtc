import { format, differenceInDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Trip, LegalDocument } from '../types';

export function formatDateFR(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
}

export function formatDateTimeFR(date: Date = new Date()): string {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function getDocExpiryStatus(doc: LegalDocument): 'ok' | 'soon' | 'expired' | 'unknown' {
  if (!doc.expiryDate) return 'unknown';
  const days = differenceInDays(new Date(doc.expiryDate), new Date());
  if (days < 0) return 'expired';
  if (days < 30) return 'soon';
  return 'ok';
}

export function getDocExpiryDays(doc: LegalDocument): number | null {
  if (!doc.expiryDate) return null;
  return differenceInDays(new Date(doc.expiryDate), new Date());
}

export function getVaultComplianceScore(docs: LegalDocument[]): { total: number; uploaded: number; valid: number; percent: number } {
  const required = docs.filter(d => d.isRequired);
  const uploaded = required.filter(d => d.fileData);
  const valid = uploaded.filter(d => {
    const status = getDocExpiryStatus(d);
    return status === 'ok' || status === 'unknown';
  });
  const total = required.length;
  return { total, uploaded: uploaded.length, valid: valid.length, percent: total > 0 ? Math.round((valid.length / total) * 100) : 0 };
}

// ─── STATS ───

export function getStats(trips: Trip[]) {
  const now = new Date();
  const weekStart = startOfWeek(now, { locale: fr });
  const monthStart = startOfMonth(now);

  const completedTrips = trips.filter(t => t.status === 'completed' || t.status === 'invoiced');

  const today = completedTrips.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
  const week = completedTrips.filter(t => isWithinInterval(new Date(t.date), { start: weekStart, end: now }));
  const month = completedTrips.filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: now }));

  const sumPrice = (arr: Trip[]) => arr.reduce((s, t) => s + t.price, 0);

  return {
    todayCount: today.length,
    todayRevenue: sumPrice(today),
    weekCount: week.length,
    weekRevenue: sumPrice(week),
    monthCount: month.length,
    monthRevenue: sumPrice(month),
    totalTrips: trips.length,
    totalRevenue: sumPrice(completedTrips),
    scheduledCount: trips.filter(t => t.status === 'scheduled').length,
    transferCount: trips.filter(t => t.tripType === 'transfer').length,
    disposalCount: trips.filter(t => t.tripType === 'disposal').length,
  };
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}
