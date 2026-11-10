'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../lib/calculations';
import { X, Sliders, Check } from 'lucide-react';

export const CategoryBudgetsModal: React.FC = () => {
  const { isBudgetModalOpen, setIsBudgetModalOpen, budgets, updateBudget, periodExpenses } = useApp();

  const [limits, setLimits] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    budgets.forEach(b => {
      map[b.categoryId] = b.monthlyLimit;
    });
    return map;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isBudgetModalOpen) return null;

  const handleLimitChange = (catId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setLimits(prev => ({ ...prev, [catId]: num }));
  };

  const handleSaveAll = async () => {
    for (const [catId, limit] of Object.entries(limits)) {
      await updateBudget(catId, limit);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsBudgetModalOpen(false);
    }, 600);
  };

  // Compute current spend per category in period to show live progress
  const categorySpent: Record<string, number> = {};
  periodExpenses.forEach(e => {
    categorySpent[e.categoryId] = (categorySpent[e.categoryId] || 0) + (Number(e.amount) || 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Límites de Presupuesto Mensual</h3>
              <p className="text-xs text-slate-400">
                Ajusta topes por categoría. Las barras avisarán en verde, amarillo y rojo.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBudgetModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {CATEGORIES.map(cat => {
            const currentLimit = limits[cat.id] ?? 0;
            const spent = categorySpent[cat.id] || 0;
            const percent = currentLimit > 0 ? (spent / currentLimit) * 100 : 0;

            let colorBar = 'bg-emerald-500';
            if (percent >= 100) colorBar = 'bg-rose-500';
            else if (percent >= 70) colorBar = 'bg-amber-500';

            return (
              <div 
                key={cat.id} 
                className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate block">{cat.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>Gastado este mes: <strong>{formatCurrency(spent)}</strong></span>
                      {currentLimit > 0 && (
                        <span>({Math.round(percent)}% consumido)</span>
                      )}
                    </div>
                    {currentLimit > 0 && (
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full ${colorBar} transition-all`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 font-semibold">Límite:</span>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="10"
                      min="0"
                      placeholder="0"
                      value={currentLimit || ''}
                      onChange={e => handleLimitChange(cat.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white text-right pr-6 focus:border-emerald-500 outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">€</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                ¡Guardado!
              </>
            ) : (
              'Guardar Presupuestos'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
