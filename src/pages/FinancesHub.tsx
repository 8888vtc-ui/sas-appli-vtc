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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Finances & Gestion
          </h1>
          <p className="text-slate-400 mt-1">Supervisez votre chiffre d'affaires, vos factures et vos charges.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1c1c1e] p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
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
