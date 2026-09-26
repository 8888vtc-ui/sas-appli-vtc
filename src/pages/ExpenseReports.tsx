import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Plus, Search, ChevronDown, Download, Camera, X, Trash2,
  Eye, Car, TrendingUp, TrendingDown, Calculator, FileText,
  CheckCircle2, AlertCircle, Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  EXPENSE_CATEGORIES,
  URSSAF_MILEAGE_SCALE_2025,
  calculateMileageAllowance,
} from '../types';
import type { ExpenseCategory, FiscalPower, Expense } from '../types';

// ─── Helper: export CSV enrichi
function exportExpensesFullCSV(expenses: Expense[]) {
  const headers = ['Date', 'Description', 'Catégorie', 'Montant_HT_EUR', 'TVA_Déductible', 'Taux_TVA', 'Montant_TVA_EUR', 'Justificatif', 'Notes'];
  const rows = expenses.map(exp => [
    exp.date, `"${exp.description.replace(/"/g, '""')}"`,
    EXPENSE_CATEGORIES[exp.category]?.label || exp.category,
    exp.amount.toFixed(2), exp.tvaDeductible ? 'Oui' : 'Non',
    `${exp.tvaRate}%`, exp.tvaAmount.toFixed(2),
    exp.receiptFileName || 'Non', `"${(exp.notes || '').replace(/"/g, '""')}"`
  ].join(';'));
  const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `notes_frais_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Main tabs
type Tab = 'expenses' | 'mileage' | 'report';

export default function ExpenseReports() {
  const { expenses, addExpense, deleteExpense, mileageLogs, addMileageLog, deleteMileageLog } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMileage, setShowAddMileage] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{ name: string; data: string } | null>(null);
  const [fiscalPower, setFiscalPower] = useState<FiscalPower>('5cv');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Expense form
  const [expForm, setExpForm] = useState({
    description: '', amount: '', category: 'fuel' as ExpenseCategory,
    date: format(new Date(), 'yyyy-MM-dd'), tvaDeductible: false,
    tvaRate: '20', notes: '', receiptPhoto: '', receiptFileName: ''
  });

  // ── Mileage form
  const [mlForm, setMlForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'), startKm: '', endKm: '',
    purpose: 'professional' as 'professional' | 'personal', description: ''
  });

  // ── Stats
  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalTVA = expenses.filter(e => e.tvaDeductible).reduce((s, e) => s + e.tvaAmount, 0);
    const withReceipt = expenses.filter(e => e.receiptPhoto).length;
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((s, e) => s + e.amount, 0);

    const proKm = mileageLogs.filter(m => m.purpose === 'professional').reduce((s, m) => s + m.distance, 0);
    const persoKm = mileageLogs.filter(m => m.purpose === 'personal').reduce((s, m) => s + m.distance, 0);
    const mileageAllowance = calculateMileageAllowance(proKm, fiscalPower);

    return { totalExpenses, totalTVA, withReceipt, monthTotal, proKm, persoKm, mileageAllowance, totalLogs: mileageLogs.length };
  }, [expenses, mileageLogs, fiscalPower]);

  // ── Filtered expenses
  const filteredExpenses = useMemo(() =>
    expenses
      .filter(e => categoryFilter === 'all' || e.category === categoryFilter)
      .filter(e =>
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
  , [expenses, categoryFilter, searchQuery]);

  // ── Category breakdown for report
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // ── Handle receipt photo capture
  const handleReceiptCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setExpForm(f => ({ ...f, receiptPhoto: ev.target?.result as string, receiptFileName: file.name }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(expForm.amount);
    const tvaRate = Number(expForm.tvaRate);
    const tvaAmount = expForm.tvaDeductible ? (amount * tvaRate) / (100 + tvaRate) : 0;
    addExpense({ ...expForm, amount, tvaRate, tvaAmount });
    setExpForm({ description: '', amount: '', category: 'fuel', date: format(new Date(), 'yyyy-MM-dd'), tvaDeductible: false, tvaRate: '20', notes: '', receiptPhoto: '', receiptFileName: '' });
    setShowAddExpense(false);
  };

  const handleAddMileage = (e: React.FormEvent) => {
    e.preventDefault();
    addMileageLog(mlForm);
    setMlForm({ date: format(new Date(), 'yyyy-MM-dd'), startKm: '', endKm: '', purpose: 'professional', description: '' });
    setShowAddMileage(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">

      {/* ══════ STATS CARDS ══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Total Dépenses', value: formatEUR(stats.totalExpenses), icon: TrendingDown, color: '#ef4444' },
          { label: 'Ce mois', value: formatEUR(stats.monthTotal), icon: Calendar, color: '#f59e0b' },
          { label: 'TVA Récupérable', value: formatEUR(stats.totalTVA), icon: TrendingUp, color: '#22c55e' },
          { label: 'Km Pro', value: `${stats.proKm.toLocaleString()} km`, icon: Car, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400">{s.label}</span>
              <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: s.color }} />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ══════ TABS + TOOLBAR ══════ */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 shrink-0">
            {([
              { key: 'expenses', label: '📝 Dépenses' },
              { key: 'mileage', label: '🚗 Kilométrage' },
              { key: 'report', label: '📊 Rapport' },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto shrink-0">
            {activeTab === 'expenses' && (
              <>
                <button onClick={() => exportExpensesFullCSV(expenses)}
                  className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                  <Download className="w-3.5 h-3.5 text-blue-400" /> <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button onClick={() => setShowAddExpense(true)} className="btn-primary py-2 px-3 text-xs font-bold">
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Dépense</span>
                </button>
              </>
            )}
            {activeTab === 'mileage' && (
              <button onClick={() => setShowAddMileage(true)} className="btn-primary py-2 px-3 text-xs font-bold">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Trajet</span>
              </button>
            )}
          </div>
        </div>

        {/* Search + filter (expenses tab only) */}
        {activeTab === 'expenses' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Rechercher une dépense..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm text-white placeholder-white/30" />
            </div>
            <div className="relative">
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="appearance-none w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white cursor-pointer outline-none">
                <option value="all">Toutes catégories</option>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {/* ══════ TAB: DÉPENSES ══════ */}
      {activeTab === 'expenses' && (
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="glass rounded-2xl p-8 sm:p-12 text-center">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30 text-white" />
              <h3 className="text-lg font-bold text-white mb-2">Aucune dépense</h3>
              <p className="text-slate-400 text-sm">Ajoutez vos premières notes de frais.</p>
            </div>
          ) : filteredExpenses.map(exp => {
            const cat = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.other;
            return (
              <div key={exp.id} className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-5 hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  {/* Category icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: `${cat.color}15` }}>
                    {cat.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{exp.description}</h3>
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{ background: `${cat.color}15`, color: cat.color }}>
                        {cat.label}
                      </span>
                      {exp.tvaDeductible && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-400 shrink-0">
                          TVA {exp.tvaRate}%
                        </span>
                      )}
                      {exp.receiptPhoto && (
                        <button onClick={() => setPreviewReceipt({ name: exp.description, data: exp.receiptPhoto! })}
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-500/15 text-blue-400 shrink-0 flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Justif.
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs mt-1 text-slate-400">
                      <span>{format(new Date(exp.date), 'dd MMM yyyy', { locale: fr })}</span>
                      {exp.tvaDeductible && <span>TVA: {formatEUR(exp.tvaAmount)}</span>}
                      {exp.notes && <span className="truncate">• {exp.notes}</span>}
                    </div>
                  </div>

                  {/* Amount + delete */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <p className="text-base sm:text-lg font-bold text-red-400">-{formatEUR(exp.amount)}</p>
                    {confirmDeleteId === exp.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { deleteExpense(exp.id); setConfirmDeleteId(null); }} className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold">Oui</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 rounded-lg bg-white/10 text-white text-[10px]">Non</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(exp.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════ TAB: KILOMÉTRAGE ══════ */}
      {activeTab === 'mileage' && (
        <div className="space-y-4">
          {/* IK Card */}
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20 bg-blue-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" /> Indemnités Kilométriques (Barème URSSAF 2025)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Pour véhicule personnel utilisé à titre professionnel</p>
              </div>
              <div className="relative shrink-0">
                <select value={fiscalPower} onChange={e => setFiscalPower(e.target.value as FiscalPower)}
                  className="appearance-none bg-white/10 border border-white/20 rounded-xl py-2 pl-3 pr-8 text-sm text-white cursor-pointer outline-none">
                  {Object.keys(URSSAF_MILEAGE_SCALE_2025).map(k => (
                    <option key={k} value={k}>{k.toUpperCase()} fiscaux</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Km Professionnels</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-400">{stats.proKm.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Km Personnels</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-300">{stats.persoKm.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <p className="text-xs text-emerald-400 mb-1 font-semibold">Indemnité IK</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-400">{formatEUR(stats.mileageAllowance)}</p>
              </div>
            </div>
          </div>

          {/* Mileage logs */}
          {mileageLogs.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Car className="w-10 h-10 mx-auto mb-3 opacity-30 text-white" />
              <h3 className="text-lg font-bold text-white mb-2">Aucun trajet enregistré</h3>
              <p className="text-slate-400 text-sm">Ajoutez vos trajets pour le suivi kilométrique.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mileageLogs.map(ml => (
                <div key={ml.id} className="glass rounded-xl p-3.5 sm:p-4 flex items-center gap-3 hover:border-white/20 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                    ml.purpose === 'professional' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-500/15 text-slate-400'
                  }`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{ml.description || 'Trajet'}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                      {format(new Date(ml.date), 'dd MMM yyyy', { locale: fr })} · {ml.startKm.toLocaleString()} → {ml.endKm.toLocaleString()} km
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p className="text-base font-bold text-white">{ml.distance} km</p>
                      <p className={`text-[10px] font-semibold ${ml.purpose === 'professional' ? 'text-blue-400' : 'text-slate-500'}`}>
                        {ml.purpose === 'professional' ? 'Pro' : 'Perso'}
                      </p>
                    </div>
                    <button onClick={() => deleteMileageLog(ml.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ TAB: RAPPORT MENSUEL ══════ */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Rapport de Frais — {format(new Date(), 'MMMM yyyy', { locale: fr })}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 mb-1">Nb Dépenses</p>
                <p className="text-xl font-bold text-white">{expenses.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 mb-1">Total Dépenses</p>
                <p className="text-xl font-bold text-red-400">{formatEUR(stats.totalExpenses)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 mb-1">TVA Récup.</p>
                <p className="text-xl font-bold text-emerald-400">{formatEUR(stats.totalTVA)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 mb-1">Justificatifs</p>
                <p className="text-xl font-bold text-blue-400">{stats.withReceipt}/{expenses.length}</p>
              </div>
            </div>

            {/* Category breakdown */}
            <h4 className="text-sm font-bold text-white mb-3">Répartition par catégorie</h4>
            <div className="space-y-2">
              {categoryBreakdown.map(([catKey, total]) => {
                const cat = EXPENSE_CATEGORIES[catKey as ExpenseCategory] || EXPENSE_CATEGORIES.other;
                const pct = stats.totalExpenses > 0 ? (total / stats.totalExpenses) * 100 : 0;
                return (
                  <div key={catKey} className="flex items-center gap-3">
                    <span className="text-sm w-6">{cat.icon}</span>
                    <span className="text-xs font-medium text-white w-32 sm:w-40 truncate">{cat.label}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: cat.color }} />
                    </div>
                    <span className="text-xs font-bold text-white w-20 text-right">{formatEUR(total)}</span>
                    <span className="text-[10px] text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IK Summary */}
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" /> Indemnités Kilométriques (Véhicule Personnel)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                <p className="text-[10px] text-blue-400 mb-1 font-semibold">Km Pro Annuels</p>
                <p className="text-xl font-bold text-white">{stats.proKm.toLocaleString()} km</p>
                <p className="text-[10px] text-slate-400 mt-1">Barème {fiscalPower.toUpperCase()} fiscaux</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 mb-1 font-semibold">Indemnité Calculée</p>
                <p className="text-xl font-bold text-emerald-400">{formatEUR(stats.mileageAllowance)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Déductible fiscalement</p>
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => exportExpensesFullCSV(expenses)}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all">
              <Download className="w-4 h-4" /> Exporter le Rapport CSV
            </button>
          </div>
        </div>
      )}

      {/* ══════ MODAL: AJOUTER DÉPENSE ══════ */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass w-full sm:max-w-lg p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-white">Nouvelle Dépense</h3>
                <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description *</label>
                  <input required type="text" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" placeholder="Ex: Plein gasoil, Péage A8..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Montant TTC (€) *</label>
                    <input required type="number" step="0.01" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Date *</label>
                    <input required type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Catégorie</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {Object.entries(EXPENSE_CATEGORIES).slice(0, 8).map(([key, { label, icon, color }]) => (
                      <button key={key} type="button" onClick={() => setExpForm({ ...expForm, category: key as ExpenseCategory })}
                        className={`flex items-center gap-1 px-2 py-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${expForm.category === key ? 'border-2' : 'bg-white/5 border border-transparent text-slate-400'}`}
                        style={expForm.category === key ? { borderColor: color, color, background: `${color}10` } : {}}>
                        <span>{icon}</span><span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                  <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value as ExpenseCategory })}
                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none text-xs">
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* TVA */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input type="checkbox" checked={expForm.tvaDeductible}
                      onChange={e => setExpForm({ ...expForm, tvaDeductible: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500" />
                    <span className="text-xs font-semibold text-white">TVA Déductible</span>
                  </label>
                  {expForm.tvaDeductible && (
                    <select value={expForm.tvaRate} onChange={e => setExpForm({ ...expForm, tvaRate: e.target.value })}
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none">
                      <option value="20">20%</option>
                      <option value="10">10%</option>
                      <option value="5.5">5.5%</option>
                    </select>
                  )}
                </div>

                {/* Receipt photo */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Justificatif (photo / scan)</label>
                  <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-white/15 hover:border-blue-500/40 cursor-pointer transition-all text-slate-400 hover:text-blue-400">
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-medium">{expForm.receiptFileName || 'Prendre une photo ou choisir un fichier'}</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleReceiptCapture} className="hidden" />
                  </label>
                  {expForm.receiptPhoto && (
                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-white/20">
                      <img src={expForm.receiptPhoto} alt="Justificatif" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setExpForm({ ...expForm, receiptPhoto: '', receiptFileName: '' })}
                        className="absolute top-0.5 right-0.5 p-1 bg-red-500 rounded-full"><X className="w-3 h-3 text-white" /></button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                  <input type="text" value={expForm.notes} onChange={e => setExpForm({ ...expForm, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none text-sm" placeholder="Notes optionnelles..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium text-sm">Annuler</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold text-sm">Enregistrer</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ MODAL: AJOUTER TRAJET ══════ */}
      <AnimatePresence>
        {showAddMileage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass w-full sm:max-w-md p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Nouveau Trajet</h3>
                <button onClick={() => setShowAddMileage(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddMileage} className="space-y-4">
                <div className="flex gap-2">
                  {(['professional', 'personal'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setMlForm({ ...mlForm, purpose: p })}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${mlForm.purpose === p ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                      {p === 'professional' ? '🚗 Professionnel' : '🏠 Personnel'}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description du trajet</label>
                  <input required type="text" value={mlForm.description} onChange={e => setMlForm({ ...mlForm, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" placeholder="Nice → Cannes A/R" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                    <input required type="date" value={mlForm.date} onChange={e => setMlForm({ ...mlForm, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Km Départ</label>
                    <input required type="number" value={mlForm.startKm} onChange={e => setMlForm({ ...mlForm, startKm: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white outline-none text-sm" placeholder="45230" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Km Arrivée</label>
                    <input required type="number" value={mlForm.endKm} onChange={e => setMlForm({ ...mlForm, endKm: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white outline-none text-sm" placeholder="45285" />
                  </div>
                </div>
                {Number(mlForm.endKm) > Number(mlForm.startKm) && (
                  <p className="text-sm text-blue-400 font-bold text-center">
                    Distance: {Number(mlForm.endKm) - Number(mlForm.startKm)} km
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddMileage(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium text-sm">Annuler</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold text-sm">Enregistrer</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ MODAL: PREVIEW RECEIPT ══════ */}
      <AnimatePresence>
        {previewReceipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass max-w-2xl w-full p-4 sm:p-6 rounded-3xl max-h-[90vh] flex flex-col border border-white/20">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" /> {previewReceipt.name}
                </h3>
                <button onClick={() => setPreviewReceipt(null)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-auto rounded-xl bg-black/40 p-2 flex items-center justify-center min-h-[200px]">
                <img src={previewReceipt.data} alt={previewReceipt.name} className="max-h-[65vh] max-w-full object-contain rounded-lg" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
