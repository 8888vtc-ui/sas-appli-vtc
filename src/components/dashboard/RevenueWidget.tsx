import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatEUR } from '../../lib/utils';
import { computeRevenueStats } from '../../lib/revenueStats';

/* Carte "CA du jour" — résumé compact, lien vers la page Chiffre d'affaires */
export default function RevenueWidget() {
  const { trips, expenses } = useApp();
  const navigate = useNavigate();
  const s = useMemo(() => computeRevenueStats(trips, expenses), [trips, expenses]);

  return (
    <button
      id="revenue-widget"
      onClick={() => navigate('/finances')}
      className="group text-left relative overflow-hidden rounded-2xl p-4 bg-[#161616] border border-white/5 hover:border-white/10 transition-all active:scale-[0.99]"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none bg-[#00ff87]/15" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#0e0e0e]">
            <TrendingUp className="w-5 h-5 text-[#00ff87]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#b4b4b4]">CA du jour</p>
            <p className="text-[24px] leading-tight font-bold text-white tracking-tight">{formatEUR(s.today.amount)}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#b4b4b4] mt-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="Courses" value={String(s.today.count)} />
        <Mini label="Prévu" value={formatEUR(s.today.planned)} accent />
        <Mini label="Semaine" value={formatEUR(s.week.amount)} />
      </div>
    </button>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-[#0e0e0e] px-2 py-1.5 min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[#b4b4b4]/80">{label}</p>
      <p className={`text-[13px] font-bold truncate ${accent ? 'text-white' : 'text-white'}`}>{value}</p>
    </div>
  );
}
