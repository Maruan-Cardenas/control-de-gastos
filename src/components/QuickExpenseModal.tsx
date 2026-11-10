'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PEOPLE, CATEGORIES } from '../lib/constants';
import { Person } from '../types';
import { calculateHoursEquivalent } from '../lib/calculations';
import { CategoryIcon } from './CategoryIcon';
import { X, Sparkles, Calendar, Tag, User, DollarSign, FileText } from 'lucide-react';

export const QuickExpenseModal: React.FC = () => {
  const { isQuickExpenseOpen, setIsQuickExpenseOpen, addExpense } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('2026-11-10');
  const [selectedPerson, setSelectedPerson] = useState<Person>('Marwan');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('supermercado');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Today and Yesterday date helper strings
  const getTodayStr = () => '2026-11-10';
  const getYesterdayStr = () => '2026-11-09';

  // Set default date to today when opened & auto-focus on amount
  useEffect(() => {
    if (isQuickExpenseOpen) {
      setDate(getTodayStr());
      setAmount('');
      setNotes('');
      setSelectedSubcategory('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isQuickExpenseOpen]);

  // Update available subcategories when category changes
  const activeCategory = CATEGORIES.find(c => c.id === selectedCategoryId);
  useEffect(() => {
    if (activeCategory && activeCategory.subcategories.length > 0) {
      setSelectedSubcategory(activeCategory.subcategories[0]);
    } else {
      setSelectedSubcategory('');
    }
  }, [selectedCategoryId, activeCategory]);

  if (!isQuickExpenseOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const hoursEquiv = calculateHoursEquivalent(numAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: numAmount,
        date,
        person: selectedPerson,
        categoryId: selectedCategoryId,
        subcategory: selectedSubcategory || undefined,
        notes: notes.trim() || undefined,
      });
      setIsQuickExpenseOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Gasto Rápido</h2>
              <p className="text-xs text-slate-400">Asigna el monto, responsable y categoría</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickExpenseOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Amount input with autofocus + Psychological hours banner */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Importe del Gasto (€) *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/90 border-2 border-emerald-500/50 focus:border-emerald-400 rounded-xl text-2xl font-black text-white placeholder-slate-500 outline-none transition text-center shadow-inner"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">€</span>
            </div>

            {/* Psychological conversion preview */}
            {numAmount > 0 && (
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Equivalente en esfuerzo:
                </span>
                <span className="font-bold text-white bg-slate-700/60 px-2 py-0.5 rounded">
                  {hoursEquiv.formattedText} de trabajo
                </span>
              </div>
            )}
          </div>

          {/* Date Selector with quick 'Hoy' and 'Ayer' */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDate(getTodayStr())}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition ${
                    date === getTodayStr()
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setDate(getYesterdayStr())}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition ${
                    date === getYesterdayStr()
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Ayer
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-slate-500 transition"
            />
          </div>

          {/* Person Chips Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Asignar a Persona *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {PEOPLE.map(p => {
                const isSelected = selectedPerson === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPerson(p.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.id.slice(0, 2)}
                    </div>
                    <span className="truncate max-w-full">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Chips Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Categoría *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-2 rounded-xl text-left border flex items-center gap-2.5 transition text-xs font-medium ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} size={15} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Selector */}
          {activeCategory && activeCategory.subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Subcategoría
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeCategory.subcategories.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition ${
                      selectedSubcategory === sub
                        ? 'bg-slate-700 text-white font-semibold border border-slate-600'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes / Concept */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Concepto / Notas (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Compra Mercadona, cena con amigos, gasolina..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:border-slate-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuickExpenseOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
