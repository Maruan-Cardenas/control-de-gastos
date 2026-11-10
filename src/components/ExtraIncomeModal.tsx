'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PEOPLE } from '../lib/constants';
import { Person } from '../types';
import { X, Plus, DollarSign, Calendar, FileText, User } from 'lucide-react';

export const ExtraIncomeModal: React.FC = () => {
  const { isExtraIncomeOpen, setIsExtraIncomeOpen, addExtraIncome } = useApp();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-11-10');
  const [description, setDescription] = useState('');
  const [person, setPerson] = useState<Person>('Marwan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isExtraIncomeOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0 || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await addExtraIncome({
        amount: num,
        date,
        description: description.trim(),
        person,
      });
      setIsExtraIncomeOpen(false);
      setAmount('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Ingreso Extra</h2>
              <p className="text-xs text-slate-400">Ventas de segunda mano, trabajos puntuales, ayudas</p>
            </div>
          </div>
          <button
            onClick={() => setIsExtraIncomeOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Monto (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-lg font-bold text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Procedencia / Descripción *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Venta Wallapop, arreglo informático, devolución..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Persona Asignada
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PEOPLE.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPerson(p.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                    person === p.id
                      ? 'border-blue-500 bg-blue-500/20 text-white shadow'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsExtraIncomeOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition active:scale-95"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Ingreso Extra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
