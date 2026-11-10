'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/calculations';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank as PiggyBankIcon,
  Plus
} from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface HeaderProps {
  activeTab: 'dashboard' | 'audit' | 'fixed_piggy' | 'transactions';
  setActiveTab: (tab: 'dashboard' | 'audit' | 'fixed_piggy' | 'transactions') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { 
    selectedYear, 
    selectedMonth, 
    goToPrevMonth, 
    goToNextMonth, 
    setPeriodToToday,
    totalPeriodIncome,
    totalPeriodExpenses,
    periodNetBalance,
    savingsRate,
    pendingWorkDates,
    setIsQuickExpenseOpen,
    setIsBatchWorkOpen,
    setIsExtraIncomeOpen
  } = useApp();

  const isPositive = periodNetBalance >= 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Top bar: Brand + Period Selector + Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Logo & Month Navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <Wallet className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  Control de Gastos
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Hogar
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">Gestión integral de gastos, horas e ingresos</p>
              </div>
            </div>

            {/* Period Navigator */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 shadow-inner">
              <button
                onClick={goToPrevMonth}
                title="Mes anterior"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 text-center min-w-[130px]">
                <span className="text-xs font-semibold text-white tracking-wide block">
                  {MONTH_NAMES[selectedMonth - 1]}
                </span>
                <span className="text-[11px] font-medium text-slate-400 leading-none">
                  {selectedYear}
                </span>
              </div>

              <button
                onClick={goToNextMonth}
                title="Mes siguiente"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={setPeriodToToday}
                title="Volver a mes actual"
                className="ml-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 transition"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Quick Expense CTA */}
            <button
              onClick={() => setIsQuickExpenseOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Gasto</span>
            </button>

            {/* Batch Workdays CTA with Notification badge */}
            <button
              onClick={() => setIsBatchWorkOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Jornadas</span>
              <span className="sm:hidden">Horas</span>
              {pendingWorkDates.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950 shadow animate-pulse">
                  {pendingWorkDates.length} pend.
                </span>
              )}
            </button>

            {/* Extra Income CTA */}
            <button
              onClick={() => setIsExtraIncomeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Ingreso Extra</span>
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80">
          
          {/* Incomes */}
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Ingresos Totales</p>
              <p className="text-sm font-bold text-white">{formatCurrency(totalPeriodIncome)}</p>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Gastos Totales</p>
              <p className="text-sm font-bold text-white">{formatCurrency(totalPeriodExpenses)}</p>
            </div>
          </div>

          {/* Net Balance / Surplus */}
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPositive 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Superávit / Saldo</p>
              <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(periodNetBalance)}
              </p>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PiggyBankIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Tasa de Ahorro</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-sm font-bold text-white">{savingsRate}%</p>
                <span className="text-[10px] text-slate-400">del ingreso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            4 Cuadrantes & Matriz
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Auditoría Inteligente & Horas
          </button>

          <button
            onClick={() => setActiveTab('fixed_piggy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'fixed_piggy'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Huchas & Gastos Fijos
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Lista de Gastos & Filtros
          </button>
        </nav>
      </div>
    </header>
  );
};
