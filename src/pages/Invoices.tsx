import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Receipt, CreditCard, Download, Search, ChevronDown, CheckCircle2, Clock, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';
import { exportInvoicesCSV } from '../lib/exportUtils';

export default function Invoices() {
  const { invoices, trips, togglePayment, downloadInvoice } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const stats = useMemo(() => {
    const totalTTC = invoices.reduce((s, i) => s + (i.totalTTC || 0), 0);
    const paidTTC = invoices.filter(i => i.paymentStatus === 'paid').reduce((s, i) => s + (i.totalTTC || 0), 0);
    const pendingTTC = invoices.filter(i => i.paymentStatus !== 'paid').reduce((s, i) => s + (i.totalTTC || 0), 0);
    return { totalTTC, paidTTC, pendingTTC };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        if (statusFilter === 'paid') return inv.paymentStatus === 'paid';
        if (statusFilter === 'pending') return inv.paymentStatus !== 'paid';
        return true;
      })
      .filter(inv =>
        (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.date || '').includes(searchQuery)
      );
  }, [invoices, statusFilter, searchQuery]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Facturé</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatEUR(stats.totalTTC)}</p>
          <p className="text-xs text-slate-500 mt-1">{invoices.length} facture(s) émises</p>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Encaissé (Payé)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatEUR(stats.paidTTC)}</p>
          <p className="text-xs text-slate-500 mt-1">{invoices.filter(i => i.paymentStatus === 'paid').length} réglée(s)</p>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">En attente de règlement</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatEUR(stats.pendingTTC)}</p>
          <p className="text-xs text-slate-500 mt-1">{invoices.filter(i => i.paymentStatus !== 'paid').length} en attente</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Rechercher facture, client..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none text-sm text-white placeholder-white/30 focus:border-blue-500" />
          </div>

          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 outline-none text-sm text-white cursor-pointer focus:border-blue-500">
              <option value="all">Tous les statuts</option>
              <option value="paid">Payées</option>
              <option value="pending">En attente</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-500" />
          </div>
        </div>

        <button onClick={() => exportInvoicesCSV(invoices, trips)}
          className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0">
          <Download className="w-4 h-4 text-blue-400" /> Exporter en CSV
        </button>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/10">
          <Receipt className="w-12 h-12 mx-auto mb-4 opacity-40 text-white" />
          <h3 className="text-xl font-bold mb-2 text-white">{invoices.length === 0 ? 'Aucune facture générée' : 'Aucun résultat'}</h3>
          <p className="text-slate-400 text-sm">
            {invoices.length === 0 ? 'Générez des factures professionnelles directement depuis l\'onglet Courses.' : 'Modifiez vos critères de recherche.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map(inv => {
            const isPaid = inv.paymentStatus === 'paid';
            return (
              <div key={inv.id} className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                    style={{ background: isPaid ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white font-mono text-base">{inv.invoiceNumber}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: isPaid ? '#22c55e' : '#f59e0b',
                          border: `1px solid ${isPaid ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        {isPaid ? '✓ Payée' : '⏳ En attente'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 truncate">{inv.clientName} {inv.clientPhone && `• ${inv.clientPhone}`}</p>
                    <p className="text-xs text-slate-500">Émise le {inv.date || new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{formatEUR(inv.totalTTC)}</p>
                    <p className="text-xs text-slate-400">
                      HT: {formatEUR(inv.amount)} | {inv.tvaAmount > 0 ? `TVA (10%): ${formatEUR(inv.tvaAmount)}` : 'Franchise TVA (0%)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => downloadInvoice(inv)}
                      title="Télécharger la facture en PDF"
                      className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-all">
                      <FileDown className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <button onClick={() => togglePayment(inv.id)}
                      title={isPaid ? 'Marquer comme non payée' : 'Valider le paiement'}
                      className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                        isPaid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      }`}>
                      <CreditCard className="w-4 h-4" />
                      <span className="hidden sm:inline">{isPaid ? 'Encaissé' : 'Régler'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
