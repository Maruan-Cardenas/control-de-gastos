'use client';

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PEOPLE, CATEGORIES, HOURLY_RATES } from '../lib/constants';
import { Person } from '../types';
import { buildCrossMatrix, formatCurrency } from '../lib/calculations';
import { CategoryIcon } from './CategoryIcon';
import { 
  PieChart, 
  Users, 
  Table2, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DashboardQuadrants: React.FC = () => {
  const { 
    periodExpenses, 
    periodWorkDays, 
    periodExtraIncomes,
    totalPeriodIncome, 
    totalPeriodExpenses, 
    periodNetBalance, 
    savingsRate,
    budgets,
    setIsBudgetModalOpen,
    setFilter,
    setIsQuickExpenseOpen
  } = useApp();

  // Quadrant 1: Sum by Category & budget progress
  const categoryStats = useMemo(() => {
    const totals: Record<string, number> = {};
    periodExpenses.forEach(e => {
      totals[e.categoryId] = (totals[e.categoryId] || 0) + (Number(e.amount) || 0);
    });

    return CATEGORIES.map(cat => {
      const spent = totals[cat.id] || 0;
      const budget = budgets.find(b => b.categoryId === cat.id);
      const limit = budget ? budget.monthlyLimit : 0;
      const percentOfTotal = totalPeriodExpenses > 0 ? (spent / totalPeriodExpenses) * 100 : 0;
      const percentOfBudget = limit > 0 ? (spent / limit) * 100 : 0;

      let budgetColor = 'bg-emerald-500';
      if (percentOfBudget >= 100) {
        budgetColor = 'bg-rose-500';
      } else if (percentOfBudget >= 75) {
        budgetColor = 'bg-amber-500';
      }

      return {
        ...cat,
        spent: Number(spent.toFixed(2)),
        limit,
        percentOfTotal: Number(percentOfTotal.toFixed(1)),
        percentOfBudget: Number(percentOfBudget.toFixed(0)),
        budgetColor,
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [periodExpenses, budgets, totalPeriodExpenses]);

  // Quadrant 2: Sum by Person
  const personStats = useMemo(() => {
    const totals: Record<Person, number> = {
      Marwan: 0,
      Siham: 0,
      Loujain: 0,
      Lwalida: 0,
      Lwalid: 0,
      Otros: 0,
    };

    periodExpenses.forEach(e => {
      if (totals[e.person] !== undefined) {
        totals[e.person] += Number(e.amount) || 0;
      }
    });

    return PEOPLE.map(p => {
      const spent = totals[p.id];
      const percentOfTotal = totalPeriodExpenses > 0 ? (spent / totalPeriodExpenses) * 100 : 0;
      return {
        ...p,
        spent: Number(spent.toFixed(2)),
        percentOfTotal: Number(percentOfTotal.toFixed(1)),
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [periodExpenses, totalPeriodExpenses]);

  // Quadrant 3: Cross Matrix (Persona x Categoría)
  const crossMatrix = useMemo(() => {
    return buildCrossMatrix(periodExpenses, CATEGORIES);
  }, [periodExpenses]);

  // Quadrant 4: Income breakdown details
  const workEarnings = useMemo(() => {
    let puenteSur = 0;
    let sergio = 0;
    periodWorkDays.forEach(w => {
      if (!w.isOff) {
        puenteSur += (Number(w.puenteSurHours) || 0) * HOURLY_RATES.PUENTE_SUR;
        sergio += (Number(w.sergioHours) || 0) * HOURLY_RATES.SERGIO;
      }
    });
    return {
      puenteSur: Number(puenteSur.toFixed(2)),
      sergio: Number(sergio.toFixed(2)),
      total: Number((puenteSur + sergio).toFixed(2)),
    };
  }, [periodWorkDays]);

  const extraTotal = useMemo(() => {
    return periodExtraIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [periodExtraIncomes]);

  const isSurplus = periodNetBalance >= 0;

  return (
    <div className="space-y-6">
      
      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ============================================================ */}
        {/* CUADRANTE 1: Suma total por Categoría */}
        {/* ============================================================ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Cuadrante 1: Gastos por Categoría
                  </h3>
                  <p className="text-xs text-slate-400">Total acumulado y consumo vs presupuesto</p>
                </div>
              </div>
              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                Presupuestos
              </button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {categoryStats.filter(c => c.spent > 0 || c.limit > 0).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No hay gastos registrados en este periodo todavía.
                </div>
              ) : (
                categoryStats
                  .filter(c => c.spent > 0 || c.limit > 0)
                  .map(cat => {
                    return (
                      <div 
                        key={cat.id} 
                        className="p-3 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              <CategoryIcon name={cat.iconName} size={15} />
                            </div>
                            <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                            {cat.isNonEssential && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Opcional
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-white">
                              {formatCurrency(cat.spent)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {cat.percentOfTotal}% del total
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar vs Budget if set */}
                        {cat.limit > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Presupuesto: {formatCurrency(cat.limit)}</span>
                              <span className={cat.percentOfBudget >= 100 ? 'text-rose-400 font-bold' : ''}>
                                {cat.percentOfBudget}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cat.budgetColor} transition-all duration-500`}
                                style={{ width: `${Math.min(100, cat.percentOfBudget)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Gastos Categorizados:</span>
            <span className="font-bold text-white">{formatCurrency(totalPeriodExpenses)}</span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CUADRANTE 2: Suma total por Persona */}
        {/* ============================================================ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Cuadrante 2: Gastos por Persona
                  </h3>
                  <p className="text-xs text-slate-400">Distribución de responsabilidades del hogar</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {personStats.map(p => {
                return (
                  <div
                    key={p.id}
                    onClick={() => setFilter(prev => ({ ...prev, person: p.id }))}
                    className="p-3.5 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.id.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                            {p.label}
                          </h4>
                          <p className="text-[10px] text-slate-400">{p.role}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-black text-white">{formatCurrency(p.spent)}</span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {p.percentOfTotal}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, p.percentOfTotal)}%`,
                            backgroundColor: p.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Haz clic en una persona para filtrar sus gastos.</span>
            <span className="font-bold text-white">{personStats.length} integrantes</span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CUADRANTE 3 (Matriz Cruzada): Dynamic Pivot Table */}
        {/* ============================================================ */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Table2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Cuadrante 3: Matriz Cruzada Dinámica (Persona × Categoría)
                </h3>
                <p className="text-xs text-slate-400">Tabla pivote interactiva con totales bidireccionales</p>
              </div>
            </div>
          </div>

          {/* Pivot Table with horizontal scrolling */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-850 border-b border-slate-800 text-slate-300">
                  <th className="p-3 font-bold sticky left-0 bg-slate-850 z-10 min-w-[200px]">
                    Categoría
                  </th>
                  {PEOPLE.map(p => (
                    <th key={p.id} className="p-3 font-semibold text-center min-w-[105px]">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px]" style={{ color: p.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.label}
                      </span>
                    </th>
                  ))}
                  <th className="p-3 font-bold text-right text-emerald-400 min-w-[110px] bg-slate-800/60">
                    Total Categoría
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {crossMatrix.rows.map(row => {
                  const hasExpenses = row.totalCategory > 0;
                  return (
                    <tr 
                      key={row.category.id} 
                      className={`hover:bg-slate-800/40 transition ${hasExpenses ? '' : 'opacity-40'}`}
                    >
                      <td className="p-2.5 font-medium text-white sticky left-0 bg-slate-900 flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${row.category.color}20`, color: row.category.color }}
                        >
                          <CategoryIcon name={row.category.iconName} size={13} />
                        </div>
                        <span className="truncate">{row.category.name}</span>
                      </td>

                      {PEOPLE.map(p => {
                        const cellAmount = row.personAmounts[p.id];
                        const isHigh = cellAmount > 100;
                        return (
                          <td 
                            key={p.id} 
                            className={`p-2.5 text-center font-mono ${
                              cellAmount > 0 
                                ? isHigh ? 'text-amber-300 font-bold bg-amber-500/5' : 'text-slate-200' 
                                : 'text-slate-600'
                            }`}
                          >
                            {cellAmount > 0 ? formatCurrency(cellAmount) : '—'}
                          </td>
                        );
                      })}

                      <td className="p-2.5 text-right font-bold text-white bg-slate-800/30 font-mono">
                        {row.totalCategory > 0 ? formatCurrency(row.totalCategory) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Footer row with totals */}
              <tfoot>
                <tr className="bg-slate-850 border-t-2 border-slate-700 font-bold text-xs text-white">
                  <td className="p-3 sticky left-0 bg-slate-850 z-10 text-emerald-400 font-extrabold uppercase">
                    Total por Integrante
                  </td>
                  {PEOPLE.map(p => (
                    <td key={p.id} className="p-3 text-center text-white font-mono font-extrabold">
                      {formatCurrency(crossMatrix.personTotals[p.id])}
                    </td>
                  ))}
                  <td className="p-3 text-right text-emerald-400 bg-emerald-950/30 text-sm font-black font-mono">
                    {formatCurrency(crossMatrix.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CUADRANTE 4: Balance Global (Ingresos vs Gastos) */}
        {/* ============================================================ */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Cuadrante 4: Balance Financiero Global
                </h3>
                <p className="text-xs text-slate-400">Total Ingresos vs. Total Gastos = Ahorro / Superávit</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Left: Income Breakdown */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  Ingresos del Periodo
                </span>
                <span className="text-base font-extrabold text-white">
                  {formatCurrency(totalPeriodIncome)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Puente Sur (7.50 €/h):</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(workEarnings.puenteSur)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Sergio (8.50 €/h):</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(workEarnings.sergio)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Subtotal Horas Laborables:</span>
                  <span className="font-bold text-amber-400">{formatCurrency(workEarnings.total)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Ingresos Extra / Puntuales:</span>
                  <span className="font-bold text-blue-400">{formatCurrency(extraTotal)}</span>
                </div>
              </div>
            </div>

            {/* Center: Expenses Total */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingDown className="w-4 h-4" />
                  Gastos del Periodo
                </span>
                <span className="text-base font-extrabold text-white">
                  {formatCurrency(totalPeriodExpenses)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Número de transacciones:</span>
                  <span className="font-semibold text-slate-200">{periodExpenses.length} gastos</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Media por transacción:</span>
                  <span className="font-semibold text-slate-200">
                    {formatCurrency(periodExpenses.length ? totalPeriodExpenses / periodExpenses.length : 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Categoría con más gasto:</span>
                  <span className="font-bold text-white truncate max-w-[130px]">
                    {categoryStats[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Net Balance & Savings Rate Meter */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              isSurplus 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Ahorro Neto / Superávit
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSurplus ? '+' : ''}{formatCurrency(periodNetBalance)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isSurplus 
                    ? 'Superávit saludable disponible para destinar a Huchas de Reserva.' 
                    : 'Déficit mensual: los gastos superan los ingresos generados.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Tasa de Ahorro:</span>
                  <span className={`font-black ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {savingsRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isSurplus ? 'bg-emerald-400' : 'bg-rose-400'} transition-all duration-700`}
                    style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
