'use client';

import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';
import { DashboardQuadrants } from '../components/DashboardQuadrants';
import { SmartAuditSection } from '../components/SmartAuditSection';
import { RecurringAndPiggySection } from '../components/RecurringAndPiggySection';
import { ExpensesListWithFilters } from '../components/ExpensesListWithFilters';
import { IncomeManagementSection } from '../components/IncomeManagementSection';
import { QuickExpenseModal } from '../components/QuickExpenseModal';
import { BatchWorkApprovalModal } from '../components/BatchWorkApprovalModal';
import { ExtraIncomeModal } from '../components/ExtraIncomeModal';
import { CategoryBudgetsModal } from '../components/CategoryBudgetsModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'audit' | 'fixed_piggy' | 'transactions'>('dashboard');

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        
        {/* Navigation & Period Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Application Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && <DashboardQuadrants />}
          {activeTab === 'income' && <IncomeManagementSection />}
          {activeTab === 'audit' && <SmartAuditSection />}
          {activeTab === 'fixed_piggy' && <RecurringAndPiggySection />}
          {activeTab === 'transactions' && <ExpensesListWithFilters />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>Sistema de Finanzas Familiares · Puente Sur (7.50 €/h) · Sergio (8.50 €/h)</p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sincronizado con Firestore & Almacenamiento Local Seguro
            </p>
          </div>
        </footer>

        {/* Global Modals */}
        <QuickExpenseModal />
        <BatchWorkApprovalModal />
        <ExtraIncomeModal />
        <CategoryBudgetsModal />

      </div>
    </AppProvider>
  );
}
