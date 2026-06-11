import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, 
  Trash2, Filter, Download, Receipt, PieChart,
  BarChart, Calendar, ChevronRight
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Accounting() {
  const { trips, expenses, addExpense } = useApp();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'fuel', date: format(new Date(), 'yyyy-MM-dd') });

  // Calculs financiers
  const metrics = useMemo(() => {
    const totalRev = trips.reduce((acc, t) => acc + (t.status === 'invoiced' || t.status === 'completed' ? t.price : 0), 0);
    const totalExp = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const net = totalRev - totalExp;
    return { totalRev, totalExp, net };
  }, [trips, expenses]);

  // Données pour le graphique mensuel
  const chartData = useMemo(() => {
    const months: any = {};
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return format(d, 'MMM yy', { locale: fr });
    }).reverse();

    last6Months.forEach(m => months[m] = { name: m, revenue: 0, expenses: 0 });

    trips.forEach(t => {
      const m = format(new Date(t.date), 'MMM yy', { locale: fr });
      if (months[m]) months[m].revenue += t.price;
    });

    expenses.forEach(e => {
      const m = format(new Date(e.date), 'MMM yy', { locale: fr });
      if (months[m]) months[m].expenses += Number(e.amount);
    });

    return Object.values(months);
  }, [trips, expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;
    await addExpense({ ...newExpense, amount: Number(newExpense.amount) });
    setNewExpense({ description: '', amount: '', category: 'fuel', date: format(new Date(), 'yyyy-MM-dd') });
    setShowAddExpense(false);
  };

  const categories = {
    fuel: { label: 'Carburant', color: '#3b82f6' },
    maintenance: { label: 'Entretien', color: '#f59e0b' },
    insurance: { label: 'Assurance', color: '#8b5cf6' },
    fees: { label: 'Frais Plateforme', color: '#ef4444' },
    other: { label: 'Autre', color: '#94A3B8' }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Chiffre d\'Affaires Total', value: formatEUR(metrics.totalRev), icon: TrendingUp, color: '#22c55e', trend: '+12%' },
          { label: 'Dépenses Totales', value: formatEUR(metrics.totalExp), icon: TrendingDown, color: '#ef4444', trend: '+5%' },
          { label: 'Bénéfice Net (Brut)', value: formatEUR(metrics.net), icon: Wallet, color: '#3b82f6', trend: '+15%' },
        ].map(m => (
          <div key={m.label} className="glass rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <m.icon className="w-16 h-16" style={{ color: m.color }} />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-2">{m.label}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{m.value}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">Ce mois</span>
              <span className="text-xs font-bold" style={{ color: m.color }}>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Performance Mensuelle</h3>
              <p className="text-xs text-slate-400">Comparaison CA vs Dépenses (6 derniers mois)</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"><BarChart className="w-4 h-4" /></button>
              <button className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenus" barSize={30} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Dépenses" barSize={30} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Quick List */}
        <div className="glass rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Dépenses Récentes</h3>
            <button onClick={() => setShowAddExpense(true)} className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2">
            {expenses.length === 0 ? (
              <div className="text-center py-12 opacity-30">
                <Receipt className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Aucune dépense</p>
              </div>
            ) : expenses.slice(0, 10).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${categories[exp.category as keyof typeof categories]?.color}15`, color: categories[exp.category as keyof typeof categories]?.color }}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{exp.description}</p>
                    <p className="text-[10px] text-slate-500">{format(new Date(exp.date), 'dd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-red-400">-{formatEUR(exp.amount)}</p>
                  <p className="text-[10px] text-slate-500">{categories[exp.category as keyof typeof categories]?.label}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-4 w-full py-2 text-xs font-medium text-slate-400 hover:text-white flex items-center justify-center gap-1">
            Voir tout l'historique <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Add Expense Modal Mock (conditionally rendered in page for simplicity) */}
      {showAddExpense && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Ajouter une dépense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <input required type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="Ex: Plein gasoil, Assurance..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Montant (€)</label>
                  <input required type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Catégorie</label>
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500">
                    <option value="fuel">Carburant</option>
                    <option value="maintenance">Entretien</option>
                    <option value="insurance">Assurance</option>
                    <option value="fees">Frais/Com</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                <input required type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium">Annuler</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
