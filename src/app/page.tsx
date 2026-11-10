'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { AuthScreen } from '../components/AuthScreen';
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
import { Wallet } from 'lucide-react';

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'audit' | 'fixed_piggy' | 'transactions'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 animate-pulse">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Cargando sesión...
        </div>
      </div>
    );
  }

  // Force authentication: if not logged in, render AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

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
              Cuenta Privada: {user.displayName || user.email}
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

export default function Home() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
