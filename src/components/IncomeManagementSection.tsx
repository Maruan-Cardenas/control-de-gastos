'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HOURLY_RATES, PEOPLE } from '../lib/constants';
import { WorkDayIncome, ExtraIncome, Person } from '../types';
import { calculateDailyWorkIncome, formatCurrency } from '../lib/calculations';
import { 
  Briefcase, 
  Coins, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

const WEEKDAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const IncomeManagementSection: React.FC = () => {
  const { 
    periodWorkDays, 
    periodExtraIncomes, 
    updateWorkDay, 
    deleteWorkDay,
    updateExtraIncome, 
    deleteExtraIncome,
    setIsBatchWorkOpen,
    setIsExtraIncomeOpen,
    addWorkDay
  } = useApp();

  // State for Editing a Work Day
  const [editingWorkDay, setEditingWorkDay] = useState<WorkDayIncome | null>(null);
  const [editWorkDate, setEditWorkDate] = useState('');
  const [editPuenteSurHours, setEditPuenteSurHours] = useState<number>(0);
  const [editSergioHours, setEditSergioHours] = useState<number>(0);
  const [editIsOff, setEditIsOff] = useState<boolean>(false);
  const [editWorkNotes, setEditWorkNotes] = useState<string>('');

  // State for Editing an Extra Income
  const [editingExtra, setEditingExtra] = useState<ExtraIncome | null>(null);
  const [editExtraAmount, setEditExtraAmount] = useState('');
  const [editExtraDate, setEditExtraDate] = useState('');
  const [editExtraDesc, setEditExtraDesc] = useState('');
  const [editExtraPerson, setEditExtraPerson] = useState<Person>('Marwan');

  // Summary statistics for Work Days
  const workSummary = React.useMemo(() => {
    let puenteHours = 0;
    let sergioHours = 0;
    let puenteMoney = 0;
    let sergioMoney = 0;
    let totalMoney = 0;

    periodWorkDays.forEach(w => {
      if (!w.isOff) {
        const ph = Number(w.puenteSurHours) || 0;
        const sh = Number(w.sergioHours) || 0;
        puenteHours += ph;
        sergioHours += sh;
        puenteMoney += ph * HOURLY_RATES.PUENTE_SUR;
        sergioMoney += sh * HOURLY_RATES.SERGIO;
        totalMoney += (w.totalEarned || 0);
      }
    });

    return {
      puenteHours,
      sergioHours,
      puenteMoney,
      sergioMoney,
      totalMoney,
      workedDaysCount: periodWorkDays.filter(w => !w.isOff).length,
      offDaysCount: periodWorkDays.filter(w => w.isOff).length,
    };
  }, [periodWorkDays]);

  // Summary statistics for Extra Incomes
  const extraSummaryTotal = React.useMemo(() => {
    return periodExtraIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [periodExtraIncomes]);

  // Open Edit Work Day Modal
  const handleStartEditWorkDay = (day: WorkDayIncome) => {
    setEditingWorkDay(day);
    setEditWorkDate(day.date);
    setEditPuenteSurHours(day.puenteSurHours);
    setEditSergioHours(day.sergioHours);
    setEditIsOff(day.isOff);
    setEditWorkNotes(day.notes || '');
  };

  // Save Edit Work Day
  const handleSaveWorkDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkDay) return;

    const totalEarned = calculateDailyWorkIncome(editPuenteSurHours, editSergioHours, editIsOff);

    await updateWorkDay({
      ...editingWorkDay,
      date: editWorkDate,
      puenteSurHours: editIsOff ? 0 : Number(editPuenteSurHours) || 0,
      sergioHours: editIsOff ? 0 : Number(editSergioHours) || 0,
      isOff: editIsOff,
      notes: editWorkNotes.trim(),
      totalEarned,
    });

    setEditingWorkDay(null);
  };

  // Open Edit Extra Income Modal
  const handleStartEditExtra = (extra: ExtraIncome) => {
    setEditingExtra(extra);
    setEditExtraAmount(extra.amount.toString());
    setEditExtraDate(extra.date);
    setEditExtraDesc(extra.description);
    setEditExtraPerson(extra.person);
  };

  // Save Edit Extra Income
  const handleSaveExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExtra) return;
    const num = parseFloat(editExtraAmount);
    if (!num || num <= 0 || !editExtraDesc.trim()) return;

    await updateExtraIncome({
      ...editingExtra,
      amount: num,
      date: editExtraDate,
      description: editExtraDesc.trim(),
      person: editExtraPerson,
    });

    setEditingExtra(null);
  };

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayName = WEEKDAY_NAMES_ES[d.getDay()];
    return `${dayName}, ${day}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner: Total Incomes of the month */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gestión de Ingresos (Jornadas & Extras)
            </h3>
            <p className="text-xs text-slate-300">
              Control detallado de horas trabajadas y aportaciones puntuales con edición en vivo
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl px-4 py-2 text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Ingreso Total del Periodo:</span>
          <span className="text-xl font-black text-emerald-400">
            {formatCurrency(workSummary.totalMoney + extraSummaryTotal)}
          </span>
        </div>
      </div>

      {/* Grid of the 2 Requested Quadrants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ============================================================ */}
        {/* CUADRANTE 1: Ingresos Diarios por Horas (Puente Sur y Sergio) */}
        {/* ============================================================ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Cuadrante 1: Jornadas Diarias (Horas)
                  </h3>
                  <p className="text-xs text-slate-400">Puente Sur (7.50 €/h) y Sergio (8.50 €/h)</p>
                </div>
              </div>

              <button
                onClick={() => setIsBatchWorkOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Confirmar Lote / Nuevo
              </button>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Puente Sur (7.50 €)</span>
                <span className="text-xs font-bold text-white block mt-0.5">{formatCurrency(workSummary.puenteMoney)}</span>
                <span className="text-[10px] text-slate-400 font-mono">{workSummary.puenteHours} horas</span>
              </div>
              <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sergio (8.50 €)</span>
                <span className="text-xs font-bold text-white block mt-0.5">{formatCurrency(workSummary.sergioMoney)}</span>
                <span className="text-[10px] text-slate-400 font-mono">{workSummary.sergioHours} horas</span>
              </div>
              <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-amber-300 uppercase font-bold block">Total Devengado</span>
                <span className="text-sm font-black text-amber-400 block mt-0.5">{formatCurrency(workSummary.totalMoney)}</span>
                <span className="text-[10px] text-amber-200/70">{workSummary.workedDaysCount} días trab.</span>
              </div>
            </div>

            {/* Days List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {periodWorkDays.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No hay jornadas confirmadas en este periodo. Usa el botón superior para registrar.
                </div>
              ) : (
                periodWorkDays.map(day => {
                  const puenteEarned = (Number(day.puenteSurHours) || 0) * HOURLY_RATES.PUENTE_SUR;
                  const sergioEarned = (Number(day.sergioHours) || 0) * HOURLY_RATES.SERGIO;

                  return (
                    <div
                      key={day.id || day.date}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        day.isOff 
                          ? 'bg-slate-850/40 border-slate-850 opacity-60' 
                          : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white capitalize">
                            {formatDisplayDate(day.date)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">({day.date})</span>
                          {day.isOff && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Libre / No trabajado
                            </span>
                          )}
                        </div>

                        {!day.isOff ? (
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>Puente Sur: <strong className="text-slate-200">{day.puenteSurHours}h</strong> ({formatCurrency(puenteEarned)})</span>
                            <span>·</span>
                            <span>Sergio: <strong className="text-slate-200">{day.sergioHours}h</strong> ({formatCurrency(sergioEarned)})</span>
                          </div>
                        ) : null}

                        {day.notes && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            Nota: {day.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {formatCurrency(day.totalEarned)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditWorkDay(day)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Editar jornada"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la jornada del ${day.date}?`)) {
                                deleteWorkDay(day.id || `work-${day.date}`);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Eliminar jornada"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Total Jornadas registradas: <strong className="text-white">{periodWorkDays.length}</strong></span>
            <span>Total: <strong className="text-amber-400 font-bold">{formatCurrency(workSummary.totalMoney)}</strong></span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CUADRANTE 2: Ingresos Extra (Editar y Borrar) */}
        {/* ============================================================ */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Cuadrante 2: Ingresos Extra Puntuales
                  </h3>
                  <p className="text-xs text-slate-400">Ventas, trabajillos, ayudas y aportaciones extras</p>
                </div>
              </div>

              <button
                onClick={() => setIsExtraIncomeOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Extra
              </button>
            </div>

            {/* Quick Strip */}
            <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-500/30 flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] text-blue-300 font-semibold block">Total Ingresos Extra del Mes:</span>
                <span className="text-base font-black text-blue-400 font-mono">{formatCurrency(extraSummaryTotal)}</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                {periodExtraIncomes.length} aportaciones
              </span>
            </div>

            {/* Extra Incomes List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {periodExtraIncomes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No hay ingresos extra registrados en este mes. Haz clic en "Registrar Extra" para añadir uno.
                </div>
              ) : (
                periodExtraIncomes.map(extra => {
                  const person = PEOPLE.find(p => p.id === extra.person);

                  return (
                    <div
                      key={extra.id}
                      className="p-3 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate block">
                            {extra.description}
                          </span>
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border shrink-0"
                            style={{
                              borderColor: `${person?.color}50`,
                              backgroundColor: `${person?.color}15`,
                              color: person?.color,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: person?.color }} />
                            {person?.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          Fecha: {extra.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-blue-400 font-mono">
                          +{formatCurrency(extra.amount)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditExtra(extra)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Editar ingreso extra"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el ingreso extra de ${formatCurrency(extra.amount)}?`)) {
                                deleteExtraIncome(extra.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Eliminar ingreso extra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Aportaciones extra: <strong className="text-white">{periodExtraIncomes.length}</strong></span>
            <span>Total: <strong className="text-blue-400 font-bold">{formatCurrency(extraSummaryTotal)}</strong></span>
          </div>
        </section>

      </div>

      {/* ============================================================ */}
      {/* MODAL DE EDICIÓN: JORNADA LABORAL */}
      {/* ============================================================ */}
      {editingWorkDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveWorkDay}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Editar Jornada Diaria</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingWorkDay(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={editWorkDate}
                onChange={e => setEditWorkDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            {/* Toggle No trabajado */}
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">¿Día No Trabajado / Libre?</span>
              <input
                type="checkbox"
                checked={editIsOff}
                onChange={e => setEditIsOff(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </div>

            {!editIsOff ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Puente Sur (7.50 €/h)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={editPuenteSurHours}
                      onChange={e => setEditPuenteSurHours(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                    <span className="text-xs text-slate-400">h</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-400 mb-1">
                    Sergio (8.50 €/h)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={editSergioHours}
                      onChange={e => setEditSergioHours(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                    <span className="text-xs text-slate-400">h</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Live calculation banner */}
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total calculado del día:</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {formatCurrency(calculateDailyWorkIncome(editPuenteSurHours, editSergioHours, editIsOff))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Observaciones</label>
              <input
                type="text"
                placeholder="Ej: Turno extra, festivo..."
                value={editWorkNotes}
                onChange={e => setEditWorkNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingWorkDay(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 transition active:scale-95"
              >
                Guardar Jornada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE EDICIÓN: INGRESO EXTRA */}
      {/* ============================================================ */}
      {editingExtra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveExtra}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Editar Ingreso Extra</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingExtra(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monto (€)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={editExtraAmount}
                onChange={e => setEditExtraAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={editExtraDate}
                onChange={e => setEditExtraDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Procedencia / Concepto</label>
              <input
                type="text"
                required
                value={editExtraDesc}
                onChange={e => setEditExtraDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Persona Asignada</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PEOPLE.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditExtraPerson(p.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
                      editExtraPerson === p.id
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingExtra(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                Guardar Ingreso Extra
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
