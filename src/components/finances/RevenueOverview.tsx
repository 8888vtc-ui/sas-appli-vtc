import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, CalendarDays, CalendarRange, Car, Receipt,
  Wallet, Clock, Trophy, XCircle, Minus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatEUR } from '../../lib/utils';
import { computeRevenueStats } from '../../lib/revenueStats';

/* ═══════════════════════════════════════════════════
   Vue "Chiffre d'affaires" — métriques chauffeur VTC
   ═══════════════════════════════════════════════════ */
export default function RevenueOverview() {
  const { trips, expenses } = useApp();
  const s = useMemo(() => computeRevenueStats(trips, expenses), [trips, expenses]);
  const max = Math.max(1, ...s.last7Days.map(d => d.amount));

  return (
    <div className="flex flex-col gap-5">
      {/* ─── HERO : CA du jour ─── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-[#00ff87]/15 bg-gradient-to-br from-[#0f2a1c] via-[#121212] to-[#0e0e0e]"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#00ff87]/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#00ff87]/80">Aujourd'hui · réalisé</p>
            <p className="text-[40px] sm:text-[48px] font-black tracking-tight text-white leading-none mt-1">
              {formatEUR(s.today.amount)}
            </p>
            <p className="text-[13px] text-[#b9cbb9] mt-2">
              {s.today.count} course{s.today.count > 1 ? 's' : ''} terminée{s.today.count > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Pill icon={Clock} label="Reste prévu" value={formatEUR(s.today.planned)} sub={`${s.today.plannedCount} course(s)`} color="#ffb95f" />
            <Pill icon={TrendingUp} label="Total potentiel" value={formatEUR(s.today.amount + s.today.planned)} color="#00ff87" />
          </div>
        </div>
      </motion.section>

      {/* ─── Périodes ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PeriodCard icon={CalendarDays} title="Cette semaine" amount={s.week.amount} count={s.week.count} delta={s.week.delta} compare="vs sem. dernière" />
        <PeriodCard icon={CalendarRange} title="Ce mois-ci" amount={s.month.amount} count={s.month.count} delta={s.month.delta} compare="vs mois dernier" />
      </section>

      {/* ─── KPIs secondaires ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Receipt} label="Panier moyen" value={formatEUR(s.avgTicket)} hint="ce mois" />
        <Kpi icon={Car} label="Courses à venir" value={String(s.upcoming.count)} hint={formatEUR(s.upcoming.amount)} accent="#adc6ff" />
        <Kpi icon={Wallet} label="Net du mois" value={formatEUR(s.month.net)} hint={`Frais : ${formatEUR(s.month.expenses)}`} accent={s.month.net >= 0 ? '#00ff87' : '#ff453a'} />
        <Kpi icon={XCircle} label="Annulations" value={`${s.cancelRate.toFixed(0)} %`} hint="ce mois" accent={s.cancelRate > 15 ? '#ff453a' : '#b9cbb9'} />
      </section>

      {/* ─── 7 derniers jours ─── */}
      <section className="rounded-2xl p-5 bg-[#1c1b1b] border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-white">7 derniers jours</h2>
            <p className="text-[12px] text-[#b9cbb9]">CA réalisé par jour</p>
          </div>
          {s.bestDay && s.bestDay.amount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ffb95f]/10 text-[#ffb95f]">
              <Trophy className="w-3.5 h-3.5" /> Meilleur : {s.bestDay.label} · {formatEUR(s.bestDay.amount)}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 h-40">
          {s.last7Days.map((d, i) => {
            const h = Math.max(4, (d.amount / max) * 100);
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-2 h-full min-w-0" title={`${formatEUR(d.amount)} · ${d.count} course(s)`}>
                <span className="text-[10px] font-bold text-[#b9cbb9] truncate">{d.amount > 0 ? Math.round(d.amount) + '€' : ''}</span>
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.04, duration: 0.4 }}
                    className="w-full rounded-t-lg"
                    style={{
                      background: d.isToday
                        ? 'linear-gradient(180deg,#00ff87,#00b862)'
                        : d.amount > 0 ? 'linear-gradient(180deg,#3b4b3d,#2a2a2a)' : 'rgba(255,255,255,0.05)',
                      boxShadow: d.isToday ? '0 0 16px rgba(0,255,135,0.35)' : undefined,
                    }}
                  />
                </div>
                <span className={`text-[11px] font-bold uppercase ${d.isToday ? 'text-[#00ff87]' : 'text-[#b9cbb9]'}`}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Pill({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="flex-1 sm:flex-none rounded-2xl px-3.5 py-2.5 bg-black/40 border border-white/5 min-w-[130px]">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className="text-[18px] font-bold text-white mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-[#b9cbb9]">{sub}</p>}
    </div>
  );
}

function PeriodCard({ icon: Icon, title, amount, count, delta, compare }: {
  icon: any; title: string; amount: number; count: number; delta: number | null; compare: string;
}) {
  const up = delta != null && delta > 0.5;
  const down = delta != null && delta < -0.5;
  const color = up ? '#00ff87' : down ? '#ff453a' : '#b9cbb9';
  const DeltaIcon = up ? TrendingUp : down ? TrendingDown : Minus;

  return (
    <div className="rounded-2xl p-5 bg-[#1c1b1b] border border-white/5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#b9cbb9]">
          <Icon className="w-4 h-4" /> {title}
        </p>
        <span className="text-[12px] text-[#b9cbb9]">{count} course{count > 1 ? 's' : ''}</span>
      </div>
      <p className="text-[30px] font-black tracking-tight text-white mt-2">{formatEUR(amount)}</p>
      <p className="flex items-center gap-1.5 text-[12px] mt-1" style={{ color }}>
        <DeltaIcon className="w-3.5 h-3.5" />
        {delta == null ? 'Pas de comparaison' : `${delta > 0 ? '+' : ''}${delta.toFixed(0)} %`}
        <span className="text-[#b9cbb9]/70">{compare}</span>
      </p>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, accent = '#e5e2e1' }: {
  icon: any; label: string; value: string; hint?: string; accent?: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-[#1c1b1b] border border-white/5 min-w-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0e0e0e] mb-3">
        <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#b9cbb9] truncate">{label}</p>
      <p className="text-[20px] font-bold truncate" style={{ color: accent === '#b9cbb9' ? '#fff' : accent }}>{value}</p>
      {hint && <p className="text-[11px] text-[#b9cbb9]/70 truncate">{hint}</p>}
    </div>
  );
}
