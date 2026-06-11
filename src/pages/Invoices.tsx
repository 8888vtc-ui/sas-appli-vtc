import { motion } from 'framer-motion';
import { Receipt, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatEUR } from '../lib/utils';

export default function Invoices() {
  const { invoices, togglePayment } = useApp();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">Historique des Factures</h2>
        <p className="text-sm" style={{ color: '#94A3B8' }}>{invoices.length} facture(s) — Total: {formatEUR(invoices.reduce((s, i) => s + i.totalTTC, 0))}</p>
      </div>
      {invoices.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50 text-white" />
          <h3 className="text-xl font-bold mb-2 text-white">Aucune facture</h3>
          <p style={{ color: '#94A3B8' }}>Générez des factures depuis vos courses.</p>
        </div>
      ) : invoices.map(inv => (
        <div key={inv.id} className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: inv.paymentStatus === 'paid' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono">{inv.invoiceNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: inv.paymentStatus === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: inv.paymentStatus === 'paid' ? '#22c55e' : '#f59e0b' }}>
                  {inv.paymentStatus === 'paid' ? '✓ Payée' : '⏳ En attente'}
                </span>
              </div>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{inv.clientName} — {inv.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-white">{formatEUR(inv.totalTTC)}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>HT: {formatEUR(inv.amount)} | TVA: {formatEUR(inv.tvaAmount)}</p>
            </div>
            <button onClick={() => togglePayment(inv.id)}
              title={inv.paymentStatus === 'paid' ? 'Marquer impayée' : 'Marquer payée'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">
              <CreditCard className="w-4 h-4" style={{ color: inv.paymentStatus === 'paid' ? '#22c55e' : '#f59e0b' }} />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
