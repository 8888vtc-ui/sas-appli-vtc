import { useState } from 'react';
import { PieChart, Receipt, Wallet, TrendingUp } from 'lucide-react';
import Accounting from './Accounting';
import Invoices from './Invoices';
import ExpenseReports from './ExpenseReports';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinancesHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses'>('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
    { id: 'invoices', label: 'Factures Client', icon: Receipt },
    { id: 'expenses', label: 'Notes de Frais', icon: Wallet },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            Hub Financier
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Supervisez votre rentabilité en temps réel.</p>
        </div>
      </div>

      {/* Segmented Control iOS Style */}
      <div className="bg-[#1c1c1e]/80 backdrop-blur-xl p-1 rounded-[20px] flex items-center gap-1 shadow-inner border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] font-bold text-sm transition-all duration-300 flex-1 relative overflow-hidden ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 shadow-md border border-slate-600/50 rounded-[16px]"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <Accounting />}
            {activeTab === 'invoices' && <Invoices />}
            {activeTab === 'expenses' && <ExpenseReports />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
