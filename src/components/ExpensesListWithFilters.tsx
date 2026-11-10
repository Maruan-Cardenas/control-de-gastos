'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, PEOPLE } from '../lib/constants';
import { Person, Expense } from '../types';
import { formatCurrency, calculateHoursEquivalent } from '../lib/calculations';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  X, 
  Clock, 
  Calendar, 
  ArrowUpDown, 
  RotateCcw,
  Tag,
  User,
  SlidersHorizontal
} from 'lucide-react';

export const ExpensesListWithFilters: React.FC = () => {
  const { 
    filteredExpenses, 
    filter, 
    setFilter, 
    resetFilter, 
    deleteExpense, 
    updateExpense,
    totalPeriodExpenses 
  } = useApp();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Edit Expense modal form state
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPerson, setEditPerson] = useState<Person>('Marwan');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleStartEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditAmount(exp.amount.toString());
    setEditDate(exp.date);
    setEditPerson(exp.person);
    setEditCategoryId(exp.categoryId);
    setEditNotes(exp.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const amt = parseFloat(editAmount);
    if (!amt || amt <= 0) return;

    await updateExpense({
      ...editingExpense,
      amount: amt,
      date: editDate,
      person: editPerson,
      categoryId: editCategoryId,
      notes: editNotes.trim(),
    });
    setEditingExpense(null);
  };

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por concepto o notas (ej: Mercadona, cena, gasolina)..."
              value={filter.search}
              onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Quick Filter: Persona */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilter(prev => ({ ...prev, person: 'ALL' }))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter.person === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {PEOPLE.map(p => (
              <button
                key={p.id}
                onClick={() => setFilter(prev => ({ ...prev, person: p.id }))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                  filter.person === p.id
                    ? 'border-2 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                }`}
                style={filter.person === p.id ? { borderColor: p.color, backgroundColor: `${p.color}30` } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
              showAdvancedFilters
                ? 'bg-slate-750 border-slate-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Categoría</label>
              <select
                value={filter.categoryId}
                onChange={e => setFilter(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="ALL">Todas las Categorías (17)</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filter.startDate || ''}
                onChange={e => setFilter(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={e => setFilter(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            {/* Min / Max Amount */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mín €</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filter.minAmount ?? ''}
                  onChange={e => setFilter(prev => ({ ...prev, minAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Máx €</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filter.maxAmount ?? ''}
                  onChange={e => setFilter(prev => ({ ...prev, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <button
                onClick={resetFilter}
                title="Limpiar filtros"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Results Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Mostrando <strong>{filteredExpenses.length}</strong> gastos filtrados
          </span>
          <span>
            Suma filtrada: <strong className="text-white text-sm font-bold">{formatCurrency(filteredTotal)}</strong>
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No se encontraron gastos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="p-3 min-w-[95px]">Fecha</th>
                  <th className="p-3 min-w-[120px]">Persona</th>
                  <th className="p-3 min-w-[160px]">Categoría</th>
                  <th className="p-3 min-w-[200px]">Concepto / Detalle</th>
                  <th className="p-3 text-right min-w-[100px]">Importe</th>
                  <th className="p-3 text-center min-w-[110px]">Horas Equiv.</th>
                  <th className="p-3 text-right min-w-[80px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredExpenses.map(exp => {
                  const cat = CATEGORIES.find(c => c.id === exp.categoryId);
                  const person = PEOPLE.find(p => p.id === exp.person);
                  const hoursEquiv = calculateHoursEquivalent(exp.amount);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-850/50 transition">
                      
                      {/* Date */}
                      <td className="p-3 text-slate-300 font-mono whitespace-nowrap">
                        {exp.date}
                      </td>

                      {/* Person Pill */}
                      <td className="p-3 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                          style={{
                            borderColor: `${person?.color}50`,
                            backgroundColor: `${person?.color}15`,
                            color: person?.color,
                          }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: person?.color }} />
                          {person?.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat?.color}25`, color: cat?.color }}
                          >
                            <CategoryIcon name={cat?.iconName || ''} size={14} />
                          </div>
                          <span className="text-white font-medium">{cat?.name}</span>
                        </div>
                      </td>

                      {/* Concept / Notes */}
                      <td className="p-3 text-slate-300">
                        <div>
                          <span className="font-medium text-white">{exp.notes || '—'}</span>
                          {exp.subcategory && (
                            <span className="text-[10px] text-slate-400 block">
                              Subcat: {exp.subcategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-3 text-right font-extrabold text-white font-mono text-sm">
                        {formatCurrency(exp.amount)}
                      </td>

                      {/* Psychological Hours Equiv */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                          <Clock className="w-3 h-3" />
                          {hoursEquiv.hours}h
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Editar gasto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Deseas eliminar este gasto?')) {
                                deleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Editar Gasto</h4>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Importe (€)</label>
              <input
                type="number"
                step="0.01"
                required
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Persona</label>
              <select
                value={editPerson}
                onChange={e => setEditPerson(e.target.value as Person)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {PEOPLE.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
              <select
                value={editCategoryId}
                onChange={e => setEditCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Concepto / Notas</label>
              <input
                type="text"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
