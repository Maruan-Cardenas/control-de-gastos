'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HOURLY_RATES } from '../lib/constants';
import { WorkDayIncome } from '../types';
import { calculateDailyWorkIncome, formatCurrency } from '../lib/calculations';
import { Briefcase, CheckCircle2, Clock, X, AlertCircle, Plus, Calendar } from 'lucide-react';

interface DayDraft {
  date: string;
  puenteSurHours: number;
  sergioHours: number;
  isOff: boolean;
  notes: string;
}

const WEEKDAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const BatchWorkApprovalModal: React.FC = () => {
  const { isBatchWorkOpen, setIsBatchWorkOpen, pendingWorkDates, saveBatchWorkDays, addWorkDay, workDays } = useApp();

  const [drafts, setDrafts] = useState<DayDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualDate, setManualDate] = useState('2026-11-10');
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Initialize drafts when modal opens or pending dates change
  useEffect(() => {
    if (isBatchWorkOpen) {
      if (pendingWorkDates.length > 0) {
        setDrafts(
          pendingWorkDates.map(date => ({
            date,
            puenteSurHours: 5, // Default standard workday hours
            sergioHours: 4,
            isOff: false,
            notes: '',
          }))
        );
      } else {
        // If no pending automatic dates, provide today as initial editable day
        setDrafts([{
          date: '2026-11-10',
          puenteSurHours: 5,
          sergioHours: 4,
          isOff: false,
          notes: '',
        }]);
      }
    }
  }, [isBatchWorkOpen, pendingWorkDates]);

  if (!isBatchWorkOpen) return null;

  const updateDraft = (index: number, patch: Partial<DayDraft>) => {
    setDrafts(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleAddManualDay = () => {
    if (!manualDate) return;
    if (drafts.some(d => d.date === manualDate)) return;

    setDrafts(prev => [
      ...prev,
      {
        date: manualDate,
        puenteSurHours: 5,
        sergioHours: 4,
        isOff: false,
        notes: '',
      }
    ].sort((a, b) => a.date.localeCompare(b.date)));
    setShowManualAdd(false);
  };

  const removeDraft = (index: number) => {
    setDrafts(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals for the batch
  const batchTotalEarnings = drafts.reduce((sum, d) => {
    return sum + calculateDailyWorkIncome(d.puenteSurHours, d.sergioHours, d.isOff);
  }, 0);

  const totalPuenteSurHours = drafts.reduce((sum, d) => sum + (d.isOff ? 0 : Number(d.puenteSurHours) || 0), 0);
  const totalSergioHours = drafts.reduce((sum, d) => sum + (d.isOff ? 0 : Number(d.sergioHours) || 0), 0);

  const handleConfirmBatch = async () => {
    if (drafts.length === 0) {
      setIsBatchWorkOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmedDays: WorkDayIncome[] = drafts.map(d => ({
        id: `work-${d.date}`,
        date: d.date,
        puenteSurHours: d.isOff ? 0 : Number(d.puenteSurHours) || 0,
        sergioHours: d.isOff ? 0 : Number(d.sergioHours) || 0,
        isOff: d.isOff,
        notes: d.notes,
        totalEarned: calculateDailyWorkIncome(d.puenteSurHours, d.sergioHours, d.isOff),
        confirmedAt: Date.now(),
      }));

      await saveBatchWorkDays(confirmedDays);
      setIsBatchWorkOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayName = WEEKDAY_NAMES_ES[d.getDay()];
    return `${dayName}, ${day} de ${month === 11 ? 'Noviembre' : 'Mes ' + month} ${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Confirmación de Jornadas Laborables</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Lote (Mon - Fri)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Puente Sur ({HOURLY_RATES.PUENTE_SUR.toFixed(2)} €/h) · Sergio ({HOURLY_RATES.SERGIO.toFixed(2)} €/h)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBatchWorkOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Top batch overview card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-850 to-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Resumen de Lote ({drafts.length} {drafts.length === 1 ? 'jornada' : 'jornadas'})
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-amber-400">
                  {formatCurrency(batchTotalEarnings)}
                </span>
                <span className="text-xs text-slate-400">
                  ({totalPuenteSurHours}h Puente Sur + {totalSergioHours}h Sergio)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center gap-1.5 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              {showManualAdd ? 'Ocultar selector de fecha' : 'Añadir otra fecha'}
            </button>
          </div>

          {/* Add custom date dropdown */}
          {showManualAdd && (
            <div className="p-3 bg-slate-850 border border-slate-700 rounded-xl flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Seleccionar fecha:</span>
              <input
                type="date"
                value={manualDate}
                onChange={e => setManualDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddManualDay}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Agregar
              </button>
            </div>
          )}

          {drafts.length === 0 ? (
            <div className="text-center py-8 bg-slate-850/50 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">¡No tienes jornadas pendientes de confirmar!</p>
              <p className="text-xs text-slate-400 mt-1">Todos los días laborables del periodo están al día.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft, idx) => {
                const dayEarned = calculateDailyWorkIncome(draft.puenteSurHours, draft.sergioHours, draft.isOff);
                const puenteSurSubtotal = (Number(draft.puenteSurHours) || 0) * HOURLY_RATES.PUENTE_SUR;
                const sergioSubtotal = (Number(draft.sergioHours) || 0) * HOURLY_RATES.SERGIO;

                return (
                  <div
                    key={draft.date}
                    className={`p-4 rounded-xl border transition-all ${
                      draft.isOff
                        ? 'bg-slate-850/40 border-slate-800 opacity-70'
                        : 'bg-slate-850 border-slate-750 shadow-sm'
                    }`}
                  >
                    {/* Day header & toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <h3 className="text-sm font-bold text-white capitalize">
                          {formatDisplayDate(draft.date)}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {draft.date}
                        </span>
                      </div>

                      {/* Switch "No trabajado" */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                          <input
                            type="checkbox"
                            checked={draft.isOff}
                            onChange={e => updateDraft(idx, { isOff: e.target.checked })}
                            className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                          />
                          <span>Día No Trabajado / Libre</span>
                        </label>

                        {drafts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDraft(idx)}
                            title="Quitar este día del lote"
                            className="p-1 rounded text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inputs when working */}
                    {!draft.isOff ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 items-center">
                        
                        {/* Job 1: Puente Sur */}
                        <div className="md:col-span-5 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              Puente Sur (7.50 €/h)
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                              {formatCurrency(puenteSurSubtotal)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              value={draft.puenteSurHours}
                              onChange={e => updateDraft(idx, { puenteSurHours: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-white outline-none focus:border-emerald-500"
                            />
                            <span className="text-xs text-slate-400">horas</span>
                          </div>
                        </div>

                        {/* Job 2: Sergio */}
                        <div className="md:col-span-5 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                              Sergio (8.50 €/h)
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                              {formatCurrency(sergioSubtotal)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              value={draft.sergioHours}
                              onChange={e => updateDraft(idx, { sergioHours: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-white outline-none focus:border-blue-500"
                            />
                            <span className="text-xs text-slate-400">horas</span>
                          </div>
                        </div>

                        {/* Day Live Total */}
                        <div className="md:col-span-2 text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Día</span>
                          <span className="text-base font-black text-amber-400">
                            {formatCurrency(dayEarned)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-400 italic">
                        Marcado como día libre (0.00 € devengados).
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {drafts.length} días configurados · Total devengado:{' '}
            <strong className="text-amber-400 font-bold">{formatCurrency(batchTotalEarnings)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBatchWorkOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmBatch}
              disabled={isSubmitting || drafts.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : `Confirmar Lote (${formatCurrency(batchTotalEarnings)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
