'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Expense, 
  WorkDayIncome, 
  ExtraIncome, 
  RecurringExpense, 
  PiggyBank, 
  CategoryBudget, 
  FilterState, 
  Person 
} from '../types';
import { 
  INITIAL_EXPENSES_SEED, 
  INITIAL_WORK_DAYS_SEED, 
  INITIAL_EXTRA_INCOMES_SEED, 
  INITIAL_RECURRING_EXPENSES, 
  INITIAL_PIGGY_BANKS, 
  INITIAL_CATEGORY_BUDGETS 
} from '../lib/constants';
import { localStore, firestoreService } from '../lib/firebase';
import { getPendingWeekdays, calculateDailyWorkIncome } from '../lib/calculations';

interface AppContextType {
  // Data lists
  expenses: Expense[];
  workDays: WorkDayIncome[];
  extraIncomes: ExtraIncome[];
  recurringExpenses: RecurringExpense[];
  piggyBanks: PiggyBank[];
  budgets: CategoryBudget[];

  // Time navigation
  selectedYear: number;
  selectedMonth: number; // 1-12
  setSelectedPeriod: (year: number, month: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  setPeriodToToday: () => void;

  // Filter state
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;

  // Modals state
  isQuickExpenseOpen: boolean;
  setIsQuickExpenseOpen: (open: boolean) => void;
  isBatchWorkOpen: boolean;
  setIsBatchWorkOpen: (open: boolean) => void;
  isExtraIncomeOpen: boolean;
  setIsExtraIncomeOpen: (open: boolean) => void;
  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (open: boolean) => void;

  // Pending days for batch modal
  pendingWorkDates: string[];

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  saveBatchWorkDays: (days: WorkDayIncome[]) => Promise<void>;
  addWorkDay: (day: WorkDayIncome) => Promise<void>;

  addExtraIncome: (income: Omit<ExtraIncome, 'id' | 'createdAt'>) => Promise<void>;
  deleteExtraIncome: (id: string) => Promise<void>;

  addRecurringExpense: (item: Omit<RecurringExpense, 'id'>) => Promise<void>;
  toggleRecurringExpense: (id: string) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;

  addPiggyBank: (bank: Omit<PiggyBank, 'id'>) => Promise<void>;
  updatePiggyBank: (bank: PiggyBank) => Promise<void>;
  contributeToPiggyBank: (id: string, amount: number) => Promise<void>;
  deletePiggyBank: (id: string) => Promise<void>;

  updateBudget: (categoryId: string, limit: number) => Promise<void>;

  // Filtered & Period Computations
  periodExpenses: Expense[];
  periodWorkDays: WorkDayIncome[];
  periodExtraIncomes: ExtraIncome[];
  filteredExpenses: Expense[];

  totalPeriodIncome: number;
  totalPeriodExpenses: number;
  periodNetBalance: number;
  savingsRate: number; // in percent
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to November 2026 (or current system date)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  // States initialized from local storage or seeds
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    return localStore.get<Expense[]>('expenses', INITIAL_EXPENSES_SEED);
  });

  const [workDays, setWorkDays] = useState<WorkDayIncome[]>(() => {
    return localStore.get<WorkDayIncome[]>('work_days', INITIAL_WORK_DAYS_SEED);
  });

  const [extraIncomes, setExtraIncomes] = useState<ExtraIncome[]>(() => {
    return localStore.get<ExtraIncome[]>('extra_incomes', INITIAL_EXTRA_INCOMES_SEED);
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    return localStore.get<RecurringExpense[]>('recurring_expenses', INITIAL_RECURRING_EXPENSES);
  });

  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>(() => {
    return localStore.get<PiggyBank[]>('piggy_banks', INITIAL_PIGGY_BANKS);
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    return localStore.get<CategoryBudget[]>('category_budgets', INITIAL_CATEGORY_BUDGETS);
  });

  // Modals state
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isBatchWorkOpen, setIsBatchWorkOpen] = useState(false);
  const [isExtraIncomeOpen, setIsExtraIncomeOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Filters state
  const defaultFilter: FilterState = {
    search: '',
    person: 'ALL',
    categoryId: 'ALL',
  };
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  const resetFilter = () => setFilter(defaultFilter);

  // Try fetching fresh data from Firestore once on mount
  useEffect(() => {
    firestoreService.fetchAllData().then(remoteData => {
      if (remoteData) {
        if (remoteData.expenses.length > 0) setExpenses(remoteData.expenses);
        if (remoteData.workDays.length > 0) setWorkDays(remoteData.workDays);
        if (remoteData.extraIncomes.length > 0) setExtraIncomes(remoteData.extraIncomes);
        if (remoteData.recurringExpenses.length > 0) setRecurringExpenses(remoteData.recurringExpenses);
        if (remoteData.piggyBanks.length > 0) setPiggyBanks(remoteData.piggyBanks);
        if (remoteData.budgets.length > 0) setBudgets(remoteData.budgets);
      }
    });
  }, []);

  // Save to localStore on changes
  useEffect(() => localStore.set('expenses', expenses), [expenses]);
  useEffect(() => localStore.set('work_days', workDays), [workDays]);
  useEffect(() => localStore.set('extra_incomes', extraIncomes), [extraIncomes]);
  useEffect(() => localStore.set('recurring_expenses', recurringExpenses), [recurringExpenses]);
  useEffect(() => localStore.set('piggy_banks', piggyBanks), [piggyBanks]);
  useEffect(() => localStore.set('category_budgets', budgets), [budgets]);

  // Compute pending work days for batch approval
  // Default range: check from start of month up to today (2026-11-10)
  const pendingWorkDates = useMemo(() => {
    // Current date in Nov 2026
    const today = '2026-11-10';
    const monthStart = '2026-11-01';
    return getPendingWeekdays(monthStart, today, workDays);
  }, [workDays]);

  // Prompt batch work confirmation on load if there are pending days and user hasn't seen it yet
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('gastos_batch_modal_dismissed');
    if (!hasSeenModal && pendingWorkDates.length > 0) {
      setIsBatchWorkOpen(true);
      sessionStorage.setItem('gastos_batch_modal_dismissed', 'true');
    }
  }, [pendingWorkDates]);

  // Period navigation helpers
  const setSelectedPeriod = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(y => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(y => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const setPeriodToToday = () => {
    setSelectedYear(2026);
    setSelectedMonth(11);
  };

  // Actions
  const addExpense = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    await firestoreService.saveExpense(newExpense);
  };

  const updateExpense = async (expense: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === expense.id ? expense : e)));
    await firestoreService.saveExpense(expense);
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await firestoreService.deleteExpense(id);
  };

  const addWorkDay = async (day: WorkDayIncome) => {
    setWorkDays(prev => {
      const exists = prev.some(w => w.id === day.id || w.date === day.date);
      if (exists) {
        return prev.map(w => (w.date === day.date ? day : w));
      }
      return [day, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
    await firestoreService.saveWorkDay(day);
  };

  const saveBatchWorkDays = async (days: WorkDayIncome[]) => {
    setWorkDays(prev => {
      const dayMap = new Map(prev.map(w => [w.date, w]));
      days.forEach(d => dayMap.set(d.date, d));
      return Array.from(dayMap.values()).sort((a, b) => b.date.localeCompare(a.date));
    });
    await firestoreService.saveWorkDaysBatch(days);
  };

  const addExtraIncome = async (data: Omit<ExtraIncome, 'id' | 'createdAt'>) => {
    const newIncome: ExtraIncome = {
      ...data,
      id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    setExtraIncomes(prev => [newIncome, ...prev]);
    await firestoreService.saveExtraIncome(newIncome);
  };

  const deleteExtraIncome = async (id: string) => {
    setExtraIncomes(prev => prev.filter(i => i.id !== id));
    await firestoreService.deleteExtraIncome(id);
  };

  const addRecurringExpense = async (item: Omit<RecurringExpense, 'id'>) => {
    const newItem: RecurringExpense = {
      ...item,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setRecurringExpenses(prev => [...prev, newItem]);
    await firestoreService.saveRecurringExpense(newItem);
  };

  const toggleRecurringExpense = async (id: string) => {
    const item = recurringExpenses.find(r => r.id === id);
    if (!item) return;
    const updated = { ...item, active: !item.active };
    setRecurringExpenses(prev => prev.map(r => (r.id === id ? updated : r)));
    await firestoreService.saveRecurringExpense(updated);
  };

  const deleteRecurringExpense = async (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    await firestoreService.deleteRecurringExpense(id);
  };

  const addPiggyBank = async (bank: Omit<PiggyBank, 'id'>) => {
    const newBank: PiggyBank = {
      ...bank,
      id: `piggy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setPiggyBanks(prev => [...prev, newBank]);
    await firestoreService.savePiggyBank(newBank);
  };

  const updatePiggyBank = async (bank: PiggyBank) => {
    setPiggyBanks(prev => prev.map(p => (p.id === bank.id ? bank : p)));
    await firestoreService.savePiggyBank(bank);
  };

  const contributeToPiggyBank = async (id: string, amount: number) => {
    const target = piggyBanks.find(p => p.id === id);
    if (!target) return;
    const updated = {
      ...target,
      currentAmount: Math.max(0, Number((target.currentAmount + amount).toFixed(2))),
    };
    setPiggyBanks(prev => prev.map(p => (p.id === id ? updated : p)));
    await firestoreService.savePiggyBank(updated);
  };

  const deletePiggyBank = async (id: string) => {
    setPiggyBanks(prev => prev.filter(p => p.id !== id));
    await firestoreService.deletePiggyBank(id);
  };

  const updateBudget = async (categoryId: string, monthlyLimit: number) => {
    const budget: CategoryBudget = { categoryId, monthlyLimit };
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.categoryId === categoryId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = budget;
        return copy;
      }
      return [...prev, budget];
    });
    await firestoreService.saveBudget(budget);
  };

  // Period filtered items
  const periodMonthStr = String(selectedMonth).padStart(2, '0');
  const periodPrefix = `${selectedYear}-${periodMonthStr}`;

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(periodPrefix));
  }, [expenses, periodPrefix]);

  const periodWorkDays = useMemo(() => {
    return workDays.filter(w => w.date.startsWith(periodPrefix));
  }, [workDays, periodPrefix]);

  const periodExtraIncomes = useMemo(() => {
    return extraIncomes.filter(i => i.date.startsWith(periodPrefix));
  }, [extraIncomes, periodPrefix]);

  // Expenses with user filters applied
  const filteredExpenses = useMemo(() => {
    return periodExpenses.filter(e => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchNotes = e.notes?.toLowerCase().includes(q);
        const matchSub = e.subcategory?.toLowerCase().includes(q);
        if (!matchNotes && !matchSub) return false;
      }
      if (filter.person !== 'ALL' && e.person !== filter.person) {
        return false;
      }
      if (filter.categoryId !== 'ALL' && e.categoryId !== filter.categoryId) {
        return false;
      }
      if (filter.minAmount !== undefined && e.amount < filter.minAmount) {
        return false;
      }
      if (filter.maxAmount !== undefined && e.amount > filter.maxAmount) {
        return false;
      }
      if (filter.startDate && e.date < filter.startDate) {
        return false;
      }
      if (filter.endDate && e.date > filter.endDate) {
        return false;
      }
      return true;
    });
  }, [periodExpenses, filter]);

  // Period Totals
  const totalPeriodIncome = useMemo(() => {
    const workIncome = periodWorkDays.reduce((acc, w) => acc + (w.totalEarned || 0), 0);
    const extraTotal = periodExtraIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    return Number((workIncome + extraTotal).toFixed(2));
  }, [periodWorkDays, periodExtraIncomes]);

  const totalPeriodExpenses = useMemo(() => {
    const sum = periodExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    return Number(sum.toFixed(2));
  }, [periodExpenses]);

  const periodNetBalance = useMemo(() => {
    return Number((totalPeriodIncome - totalPeriodExpenses).toFixed(2));
  }, [totalPeriodIncome, totalPeriodExpenses]);

  const savingsRate = useMemo(() => {
    if (totalPeriodIncome <= 0) return 0;
    const rate = ((totalPeriodIncome - totalPeriodExpenses) / totalPeriodIncome) * 100;
    return Number(rate.toFixed(1));
  }, [totalPeriodIncome, totalPeriodExpenses]);

  return (
    <AppContext.Provider
      value={{
        expenses,
        workDays,
        extraIncomes,
        recurringExpenses,
        piggyBanks,
        budgets,

        selectedYear,
        selectedMonth,
        setSelectedPeriod,
        goToPrevMonth,
        goToNextMonth,
        setPeriodToToday,

        filter,
        setFilter,
        resetFilter,

        isQuickExpenseOpen,
        setIsQuickExpenseOpen,
        isBatchWorkOpen,
        setIsBatchWorkOpen,
        isExtraIncomeOpen,
        setIsExtraIncomeOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,

        pendingWorkDates,

        addExpense,
        updateExpense,
        deleteExpense,

        saveBatchWorkDays,
        addWorkDay,

        addExtraIncome,
        deleteExtraIncome,

        addRecurringExpense,
        toggleRecurringExpense,
        deleteRecurringExpense,

        addPiggyBank,
        updatePiggyBank,
        contributeToPiggyBank,
        deletePiggyBank,

        updateBudget,

        periodExpenses,
        periodWorkDays,
        periodExtraIncomes,
        filteredExpenses,

        totalPeriodIncome,
        totalPeriodExpenses,
        periodNetBalance,
        savingsRate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
