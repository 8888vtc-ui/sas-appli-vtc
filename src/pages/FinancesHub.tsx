import { useState } from 'react';
import { TrendingUp, PieChart, Receipt, Wallet } from 'lucide-react';
import Accounting from './Accounting';
import Invoices from './Invoices';
import ExpenseReports from './ExpenseReports';
import RevenueOverview from '../components/finances/RevenueOverview';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'revenue' | 'accounting' | 'invoices' | 'expenses';

export default function FinancesHub() {
  const [activeTab, setActiveTab] = useState<TabId>('revenue');

  const tabs = [
    { id: 'revenue', label: 'Revenus', icon: TrendingUp },
    { id: 'accounting', label: 'Comptabilité', icon: PieChart },
    { id: 'invoices', label: 'Factures', icon: Receipt },
    { id: 'expenses', label: 'Frais', icon: Wallet },
  ] as const;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[28px] sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[#00ff87]/10 border border-[#00ff87]/20 shadow-[0_0_15px_rgba(0,255,135,0.2)]">
            <TrendingUp className="w-6 h-6 text-[#00ff87]" />
          </span>
          Chiffre d'affaires
        </h1>
        <p className="text-slate-400 mt-2 text-sm font-medium">Vos recettes, vos courses et votre rentabilité en un coup d'œil.</p>
      </header>

      {/* Segmented control — scrollable sur petits écrans */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl p-1 rounded-[20px] flex items-center gap-1 border border-white/5 min-w-max sm:min-w-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`finances-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] font-bold text-sm transition-colors duration-300 flex-1 relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#1c1b1b] shadow-md border border-white/10 rounded-[16px]"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#00ff87]' : ''}`} />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'revenue' && <RevenueOverview />}
            {activeTab === 'accounting' && <Accounting />}
            {activeTab === 'invoices' && <Invoices />}
            {activeTab === 'expenses' && <ExpenseReports />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
