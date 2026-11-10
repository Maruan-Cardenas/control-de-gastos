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
import { useAuth } from './AuthContext';

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
  updateWorkDay: (day: WorkDayIncome) => Promise<void>;
  deleteWorkDay: (id: string) => Promise<void>;

  addExtraIncome: (income: Omit<ExtraIncome, 'id' | 'createdAt'>) => Promise<void>;
  updateExtraIncome: (income: ExtraIncome) => Promise<void>;
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
  const { user } = useAuth();
  const userId = user?.uid || '';

  // Default to November 2026 (or current system date)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  // States scoped to active user
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workDays, setWorkDays] = useState<WorkDayIncome[]>([]);
  const [extraIncomes, setExtraIncomes] = useState<ExtraIncome[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);

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

  // Load user data whenever userId changes
  useEffect(() => {
    if (!userId) {
      setExpenses([]);
      setWorkDays([]);
      setExtraIncomes([]);
      setRecurringExpenses([]);
      setPiggyBanks([]);
      setBudgets([]);
      return;
    }

    // First load from user-specific local storage
    const cachedExpenses = localStore.getUser<Expense[]>(userId, 'expenses', []);
    const cachedWorkDays = localStore.getUser<WorkDayIncome[]>(userId, 'work_days', []);
    const cachedExtraIncomes = localStore.getUser<ExtraIncome[]>(userId, 'extra_incomes', []);
    const cachedRecurring = localStore.getUser<RecurringExpense[]>(userId, 'recurring_expenses', []);
    const cachedPiggy = localStore.getUser<PiggyBank[]>(userId, 'piggy_banks', []);
    const cachedBudgets = localStore.getUser<CategoryBudget[]>(userId, 'category_budgets', INITIAL_CATEGORY_BUDGETS);

    setExpenses(cachedExpenses);
    setWorkDays(cachedWorkDays);
    setExtraIncomes(cachedExtraIncomes);
    setRecurringExpenses(cachedRecurring);
    setPiggyBanks(cachedPiggy);
    setBudgets(cachedBudgets);

    // Fetch fresh user-scoped data from Firestore
    firestoreService.fetchAllData(userId).then(remoteData => {
      if (remoteData) {
        // If user already has data in Firestore, populate
        const hasAnyData = remoteData.expenses.length > 0 || 
                           remoteData.workDays.length > 0 || 
                           remoteData.extraIncomes.length > 0 ||
                           remoteData.recurringExpenses.length > 0 ||
                           remoteData.piggyBanks.length > 0;

        if (hasAnyData) {
          setExpenses(remoteData.expenses);
          setWorkDays(remoteData.workDays);
          setExtraIncomes(remoteData.extraIncomes);
          setRecurringExpenses(remoteData.recurringExpenses);
          setPiggyBanks(remoteData.piggyBanks);
          setBudgets(remoteData.budgets.length > 0 ? remoteData.budgets : INITIAL_CATEGORY_BUDGETS);

          localStore.setUser(userId, 'expenses', remoteData.expenses);
          localStore.setUser(userId, 'work_days', remoteData.workDays);
          localStore.setUser(userId, 'extra_incomes', remoteData.extraIncomes);
          localStore.setUser(userId, 'recurring_expenses', remoteData.recurringExpenses);
          localStore.setUser(userId, 'piggy_banks', remoteData.piggyBanks);
          localStore.setUser(userId, 'category_budgets', remoteData.budgets.length > 0 ? remoteData.budgets : INITIAL_CATEGORY_BUDGETS);
        } else if (cachedExpenses.length === 0 && cachedWorkDays.length === 0) {
          // If completely new user and no cache, initialize them with template seeds so they can explore
          setExpenses(INITIAL_EXPENSES_SEED);
          setWorkDays(INITIAL_WORK_DAYS_SEED);
          setExtraIncomes(INITIAL_EXTRA_INCOMES_SEED);
          setRecurringExpenses(INITIAL_RECURRING_EXPENSES);
          setPiggyBanks(INITIAL_PIGGY_BANKS);
          setBudgets(INITIAL_CATEGORY_BUDGETS);

          // Save starter template to their private Firestore collection
          INITIAL_EXPENSES_SEED.forEach(e => firestoreService.saveExpense(userId, e));
          firestoreService.saveWorkDaysBatch(userId, INITIAL_WORK_DAYS_SEED);
          INITIAL_EXTRA_INCOMES_SEED.forEach(i => firestoreService.saveExtraIncome(userId, i));
          INITIAL_RECURRING_EXPENSES.forEach(r => firestoreService.saveRecurringExpense(userId, r));
          INITIAL_PIGGY_BANKS.forEach(p => firestoreService.savePiggyBank(userId, p));
          INITIAL_CATEGORY_BUDGETS.forEach(b => firestoreService.saveBudget(userId, b));

          localStore.setUser(userId, 'expenses', INITIAL_EXPENSES_SEED);
          localStore.setUser(userId, 'work_days', INITIAL_WORK_DAYS_SEED);
          localStore.setUser(userId, 'extra_incomes', INITIAL_EXTRA_INCOMES_SEED);
          localStore.setUser(userId, 'recurring_expenses', INITIAL_RECURRING_EXPENSES);
          localStore.setUser(userId, 'piggy_banks', INITIAL_PIGGY_BANKS);
          localStore.setUser(userId, 'category_budgets', INITIAL_CATEGORY_BUDGETS);
        }
      }
    });
  }, [userId]);

  // Save to user-scoped localStore on changes
  useEffect(() => {
    if (userId) localStore.setUser(userId, 'expenses', expenses);
  }, [expenses, userId]);

  useEffect(() => {
    if (userId) localStore.setUser(userId, 'work_days', workDays);
  }, [workDays, userId]);

  useEffect(() => {
    if (userId) localStore.setUser(userId, 'extra_incomes', extraIncomes);
  }, [extraIncomes, userId]);

  useEffect(() => {
    if (userId) localStore.setUser(userId, 'recurring_expenses', recurringExpenses);
  }, [recurringExpenses, userId]);

  useEffect(() => {
    if (userId) localStore.setUser(userId, 'piggy_banks', piggyBanks);
  }, [piggyBanks, userId]);

  useEffect(() => {
    if (userId) localStore.setUser(userId, 'category_budgets', budgets);
  }, [budgets, userId]);

  // Compute pending work days for batch approval
  const pendingWorkDates = useMemo(() => {
    const today = '2026-11-10';
    const monthStart = '2026-11-01';
    return getPendingWeekdays(monthStart, today, workDays);
  }, [workDays]);

  // Prompt batch work confirmation on load if there are pending days and user hasn't seen it yet
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem(`gastos_batch_${userId}_dismissed`);
    if (!hasSeenModal && pendingWorkDates.length > 0 && userId) {
      setIsBatchWorkOpen(true);
      sessionStorage.setItem(`gastos_batch_${userId}_dismissed`, 'true');
    }
  }, [pendingWorkDates, userId]);

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
    if (userId) {
      await firestoreService.saveExpense(userId, newExpense);
    }
  };

  const updateExpense = async (expense: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === expense.id ? expense : e)));
    if (userId) {
      await firestoreService.saveExpense(userId, expense);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (userId) {
      await firestoreService.deleteExpense(userId, id);
    }
  };

  const addWorkDay = async (day: WorkDayIncome) => {
    setWorkDays(prev => {
      const exists = prev.some(w => w.id === day.id || w.date === day.date);
      if (exists) {
        return prev.map(w => (w.date === day.date ? day : w));
      }
      return [day, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
    if (userId) {
      await firestoreService.saveWorkDay(userId, day);
    }
  };

  const saveBatchWorkDays = async (days: WorkDayIncome[]) => {
    setWorkDays(prev => {
      const dayMap = new Map(prev.map(w => [w.date, w]));
      days.forEach(d => dayMap.set(d.date, d));
      return Array.from(dayMap.values()).sort((a, b) => b.date.localeCompare(a.date));
    });
    if (userId) {
      await firestoreService.saveWorkDaysBatch(userId, days);
    }
  };

  const updateWorkDay = async (day: WorkDayIncome) => {
    setWorkDays(prev => prev.map(w => (w.id === day.id || w.date === day.date ? day : w)));
    if (userId) {
      await firestoreService.saveWorkDay(userId, day);
    }
  };

  const deleteWorkDay = async (id: string) => {
    setWorkDays(prev => prev.filter(w => w.id !== id));
    if (userId) {
      await firestoreService.deleteWorkDay(userId, id);
    }
  };

  const addExtraIncome = async (data: Omit<ExtraIncome, 'id' | 'createdAt'>) => {
    const newIncome: ExtraIncome = {
      ...data,
      id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    setExtraIncomes(prev => [newIncome, ...prev]);
    if (userId) {
      await firestoreService.saveExtraIncome(userId, newIncome);
    }
  };

  const updateExtraIncome = async (income: ExtraIncome) => {
    setExtraIncomes(prev => prev.map(i => (i.id === income.id ? income : i)));
    if (userId) {
      await firestoreService.saveExtraIncome(userId, income);
    }
  };

  const deleteExtraIncome = async (id: string) => {
    setExtraIncomes(prev => prev.filter(i => i.id !== id));
    if (userId) {
      await firestoreService.deleteExtraIncome(userId, id);
    }
  };

  const addRecurringExpense = async (item: Omit<RecurringExpense, 'id'>) => {
    const newItem: RecurringExpense = {
      ...item,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setRecurringExpenses(prev => [...prev, newItem]);
    if (userId) {
      await firestoreService.saveRecurringExpense(userId, newItem);
    }
  };

  const toggleRecurringExpense = async (id: string) => {
    const item = recurringExpenses.find(r => r.id === id);
    if (!item) return;
    const updated = { ...item, active: !item.active };
    setRecurringExpenses(prev => prev.map(r => (r.id === id ? updated : r)));
    if (userId) {
      await firestoreService.saveRecurringExpense(userId, updated);
    }
  };

  const deleteRecurringExpense = async (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    if (userId) {
      await firestoreService.deleteRecurringExpense(userId, id);
    }
  };

  const addPiggyBank = async (bank: Omit<PiggyBank, 'id'>) => {
    const newBank: PiggyBank = {
      ...bank,
      id: `piggy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setPiggyBanks(prev => [...prev, newBank]);
    if (userId) {
      await firestoreService.savePiggyBank(userId, newBank);
    }
  };

  const updatePiggyBank = async (bank: PiggyBank) => {
    setPiggyBanks(prev => prev.map(p => (p.id === bank.id ? bank : p)));
    if (userId) {
      await firestoreService.savePiggyBank(userId, bank);
    }
  };

  const contributeToPiggyBank = async (id: string, amount: number) => {
    const target = piggyBanks.find(p => p.id === id);
    if (!target) return;
    const updated = {
      ...target,
      currentAmount: Math.max(0, Number((target.currentAmount + amount).toFixed(2))),
    };
    setPiggyBanks(prev => prev.map(p => (p.id === id ? updated : p)));
    if (userId) {
      await firestoreService.savePiggyBank(userId, updated);
    }
  };

  const deletePiggyBank = async (id: string) => {
    setPiggyBanks(prev => prev.filter(p => p.id !== id));
    if (userId) {
      await firestoreService.deletePiggyBank(userId, id);
    }
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
    if (userId) {
      await firestoreService.saveBudget(userId, budget);
    }
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
        updateWorkDay,
        deleteWorkDay,

        addExtraIncome,
        updateExtraIncome,
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
