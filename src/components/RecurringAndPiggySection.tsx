'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, PEOPLE } from '../lib/constants';
import { Person } from '../types';
import { formatCurrency } from '../lib/calculations';
import { CategoryIcon } from './CategoryIcon';
import { 
  PiggyBank as PiggyBankIcon, 
  CalendarClock, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Tag, 
  User 
} from 'lucide-react';

export const RecurringAndPiggySection: React.FC = () => {
  const { 
    recurringExpenses, 
    piggyBanks, 
    addRecurringExpense, 
    toggleRecurringExpense, 
    deleteRecurringExpense,
    addPiggyBank,
    contributeToPiggyBank,
    deletePiggyBank
  } = useApp();

  // New Recurring Expense State
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recDay, setRecDay] = useState('1');
  const [recCategoryId, setRecCategoryId] = useState('vivienda');
  const [recPerson, setRecPerson] = useState<Person>('Otros');

  // New Piggy Bank State
  const [showAddPiggy, setShowAddPiggy] = useState(false);
  const [piggyName, setPiggyName] = useState('');
  const [piggyTarget, setPiggyTarget] = useState('');
  const [piggyCurrent, setPiggyCurrent] = useState('0');
  const [piggyDate, setPiggyDate] = useState('2027-06-30');
  const [piggyCategoryId, setPiggyCategoryId] = useState('imprevistos');

  // Contribute Modal State
  const [contributingPiggyId, setContributingPiggyId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Handle New Recurring Expense
  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(recAmount);
    const day = parseInt(recDay, 10);
    if (!recTitle || !amount || amount <= 0) return;

    await addRecurringExpense({
      title: recTitle.trim(),
      amount,
      dayOfMonth: Math.max(1, Math.min(31, day || 1)),
      categoryId: recCategoryId,
      person: recPerson,
      active: true,
    });

    setRecTitle('');
    setRecAmount('');
    setShowAddRecurring(false);
  };

  // Handle New Piggy Bank
  const handleCreatePiggy = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(piggyTarget);
    const initial = parseFloat(piggyCurrent) || 0;
    if (!piggyName || !target || target <= 0) return;

    await addPiggyBank({
      name: piggyName.trim(),
      targetAmount: target,
      currentAmount: initial,
      targetDate: piggyDate,
      categoryId: piggyCategoryId,
    });

    setPiggyName('');
    setPiggyTarget('');
    setPiggyCurrent('0');
    setShowAddPiggy(false);
  };

  const handleMakeContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(contributionAmount);
    if (!contributingPiggyId || isNaN(amt) || amt === 0) return;

    await contributeToPiggyBank(contributingPiggyId, amt);
    setContributingPiggyId(null);
    setContributionAmount('');
  };

  const totalMonthlyRecurring = recurringExpenses
    .filter(r => r.active)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPiggySaved = piggyBanks.reduce((sum, p) => sum + p.currentAmount, 0);
  const totalPiggyTarget = piggyBanks.reduce((sum, p) => sum + p.targetAmount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* ============================================================ */}
      {/* 1. VIRTUAL PIGGY BANKS (HUCHAS DE RESERVA) */}
      {/* ============================================================ */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <PiggyBankIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Huchas de Reserva Virtuales</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Previsión Anual / Semestral
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reserva dinero para seguros de coche, vacaciones, imprevistos o compras grandes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right mr-2 hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-medium">Total Ahorrado en Huchas:</span>
              <span className="text-sm font-bold text-indigo-400">
                {formatCurrency(totalPiggySaved)} / {formatCurrency(totalPiggyTarget)}
              </span>
            </div>
            <button
              onClick={() => setShowAddPiggy(!showAddPiggy)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Hucha
            </button>
          </div>
        </div>

        {/* Add Piggy Form */}
        {showAddPiggy && (
          <form onSubmit={handleCreatePiggy} className="mb-6 p-4 rounded-xl bg-slate-850 border border-indigo-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nombre de la Hucha</label>
              <input
                type="text"
                required
                placeholder="Ej: Seguro coche, Vacaciones..."
                value={piggyName}
                onChange={e => setPiggyName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Objetivo (€)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                placeholder="600.00"
                value={piggyTarget}
                onChange={e => setPiggyTarget(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Fondo Inicial (€)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={piggyCurrent}
                onChange={e => setPiggyCurrent(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Fecha Meta</label>
              <input
                type="date"
                required
                value={piggyDate}
                onChange={e => setPiggyDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Crear Hucha
              </button>
              <button
                type="button"
                onClick={() => setShowAddPiggy(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Piggy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {piggyBanks.map(piggy => {
            const progress = piggy.targetAmount > 0 
              ? Math.min(100, Math.round((piggy.currentAmount / piggy.targetAmount) * 100)) 
              : 0;
            const remaining = Math.max(0, piggy.targetAmount - piggy.currentAmount);

            return (
              <div
                key={piggy.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white truncate max-w-[190px]">
                      {piggy.name}
                    </span>
                    <button
                      onClick={() => deletePiggyBank(piggy.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Eliminar hucha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-lg font-black text-white">
                      {formatCurrency(piggy.currentAmount)}
                    </span>
                    <span className="text-xs text-slate-400">
                      de {formatCurrency(piggy.targetAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{progress}% acumulado</span>
                    <span>Faltan: {formatCurrency(remaining)}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Meta: {piggy.targetDate}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setContributingPiggyId(piggy.id);
                      setContributionAmount('50');
                    }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 transition"
                  >
                    + Aportar / Ajustar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contribution Dialog */}
        {contributingPiggyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <form 
              onSubmit={handleMakeContribution}
              className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3"
            >
              <h4 className="text-sm font-bold text-white">Aportar o Retirar de la Hucha</h4>
              <p className="text-xs text-slate-400">
                Introduce una cantidad positiva para aportar o negativa para retirar.
              </p>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                placeholder="50.00"
                value={contributionAmount}
                onChange={e => setContributionAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributingPiggyId(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 2. RECURRING FIXED EXPENSES (GASTOS FIJOS PROGRAMABLES) */}
      {/* ============================================================ */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Gastos Fijos Recurrentes</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {recurringExpenses.filter(r => r.active).length} Activos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Alquiler, internet, cuotas de gimnasio, suscripciones y asignaciones mensuales familiares
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right mr-2 hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-medium">Compromiso Mensual Fijo:</span>
              <span className="text-sm font-bold text-blue-400">
                {formatCurrency(totalMonthlyRecurring)}/mes
              </span>
            </div>
            <button
              onClick={() => setShowAddRecurring(!showAddRecurring)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo Gasto Fijo
            </button>
          </div>
        </div>

        {/* Add Recurring Form */}
        {showAddRecurring && (
          <form onSubmit={handleCreateRecurring} className="mb-6 p-4 rounded-xl bg-slate-850 border border-blue-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Concepto</label>
              <input
                type="text"
                required
                placeholder="Ej: Alquiler, Luz, Internet..."
                value={recTitle}
                onChange={e => setRecTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Monto (€)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                placeholder="480.00"
                value={recAmount}
                onChange={e => setRecAmount(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Día del mes (1-31)</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                required
                value={recDay}
                onChange={e => setRecDay(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Categoría</label>
              <select
                value={recCategoryId}
                onChange={e => setRecCategoryId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Persona</label>
              <select
                value={recPerson}
                onChange={e => setRecPerson(e.target.value as Person)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {PEOPLE.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Guardar Fijo
              </button>
              <button
                type="button"
                onClick={() => setShowAddRecurring(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Recurring List */}
        <div className="space-y-2">
          {recurringExpenses.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.categoryId);
            const person = PEOPLE.find(p => p.id === item.person);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                  item.active ? 'bg-slate-850 border-slate-800' : 'bg-slate-900/40 border-slate-850 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRecurringExpense(item.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                      item.active
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Día {item.dayOfMonth}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span style={{ color: cat?.color }}>{cat?.name}</span>
                      <span>·</span>
                      <span style={{ color: person?.color }}>{person?.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white font-mono">
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    onClick={() => deleteRecurringExpense(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Eliminar gasto fijo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
