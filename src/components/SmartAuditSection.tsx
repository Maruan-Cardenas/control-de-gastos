'use client';

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, HOURLY_RATES } from '../lib/constants';
import { generateSmartAudit, calculateHoursEquivalent, formatCurrency } from '../lib/calculations';
import { CategoryIcon } from './CategoryIcon';
import { 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Info, 
  Flame, 
  TrendingUp, 
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export const SmartAuditSection: React.FC = () => {
  const { periodExpenses, budgets } = useApp();

  const auditResult = useMemo(() => {
    return generateSmartAudit(periodExpenses, budgets, CATEGORIES);
  }, [periodExpenses, budgets]);

  // Breakdown of non-essential expenses
  const nonEssentialBreakdown = useMemo(() => {
    const list: { category: typeof CATEGORIES[0]; spent: number; hours: number }[] = [];
    
    CATEGORIES.filter(c => c.isNonEssential).forEach(cat => {
      const spent = periodExpenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      if (spent > 0) {
        list.push({
          category: cat,
          spent: Number(spent.toFixed(2)),
          hours: calculateHoursEquivalent(spent).hours,
        });
      }
    });

    return list.sort((a, b) => b.spent - a.spent);
  }, [periodExpenses]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner: Psychology of Work Hours */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Auditoría Inteligente & Traducción Psicológica de Horas
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Media {HOURLY_RATES.WEIGHTED_AVERAGE.toFixed(2)} €/h
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cada euro gastado en compras prescindibles equivale a tiempo real de esfuerzo laboral en Puente Sur o Sergio.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl px-4 py-2.5 text-right shrink-0">
            <span className="text-[11px] text-slate-400 block font-medium">Esfuerzo en Gastos No Esenciales:</span>
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-xl font-black text-purple-400">
                {auditResult.nonEssentialHours} Horas
              </span>
              <span className="text-xs text-slate-400">
                (~{(auditResult.nonEssentialHours / 8).toFixed(1)} jornadas)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Alerts & Leaks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Alerts and Money Leaks */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Detección de Fugas de Dinero y Picos de Presupuesto
          </h4>

          {auditResult.alerts.length === 0 ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">¡Finanzas bajo control!</p>
              <p className="text-xs text-slate-400 mt-1">
                No se han detectado picos desmesurados ni sobrecostes por encima de los límites establecidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditResult.alerts.map(alert => {
                const isDanger = alert.type === 'danger';
                const isWarning = alert.type === 'warning';

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition shadow-sm ${
                      isDanger
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-blue-950/20 border-blue-500/40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isDanger 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : isWarning 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {isDanger ? <Flame className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">{alert.title}</h5>
                        {alert.equivalentHours !== undefined && (
                          <span className="text-[11px] font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                            {alert.equivalentHours}h de trabajo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Practical Money-Saving Recommendations */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Recomendaciones Automáticas de Optimización
            </h5>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Comer fuera:</strong> Reducir solo una salida a cenar al mes te ahorra ~35 €, equivalentes a más de <strong>4 horas y media de trabajo</strong> libre de estrés.
              </li>
              <li>
                <strong>Suscripciones:</strong> Audita plataformas digitales inactivas; cancelar una suscripción de 15 €/mes recupera casi 2 jornadas de sueldo al año.
              </li>
              <li>
                <strong>Regla de las 72 horas para caprichos:</strong> Si sientes el impulso de comprar un gadget o capricho, anótalo y espera 3 días antes de comprar.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Non-Essential Categories & Working Hours conversion */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Gastos Opcionales en Horas
              </h4>
            </div>

            <div className="space-y-3">
              {nonEssentialBreakdown.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No hay gastos opcionales registrados en este mes.
                </div>
              ) : (
                nonEssentialBreakdown.map(item => (
                  <div 
                    key={item.category.id} 
                    className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.category.color}25`, color: item.category.color }}
                      >
                        <CategoryIcon name={item.category.iconName} size={15} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{item.category.name}</span>
                        <span className="text-[10px] text-slate-400">{formatCurrency(item.spent)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block font-mono">
                        {item.hours} h
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {(item.hours / 8).toFixed(1)} jornadas
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-400">
            Total No Esencial: <strong className="text-white">{formatCurrency(auditResult.nonEssentialTotal)}</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
