import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  Firestore 
} from 'firebase/firestore';
import { Expense, WorkDayIncome, ExtraIncome, RecurringExpense, PiggyBank, CategoryBudget } from '../types';

// Web app's Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBqIkxM88V_mKaFeNZ8diLhMrCgqeBKHsM",
  authDomain: "control-de-gastos-75be4.firebaseapp.com",
  projectId: "control-de-gastos-75be4",
  storageBucket: "control-de-gastos-75be4.firebasestorage.app",
  messagingSenderId: "335796986031",
  appId: "1:335796986031:web:0d860e9dcc7578fb38b45a"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

// Firestore collection names
export const COLLECTIONS = {
  EXPENSES: 'expenses',
  WORK_DAYS: 'work_days',
  EXTRA_INCOMES: 'extra_incomes',
  RECURRING_EXPENSES: 'recurring_expenses',
  PIGGY_BANKS: 'piggy_banks',
  BUDGETS: 'category_budgets',
  METADATA: 'app_metadata'
} as const;

// Helper to check if running in browser
const isClient = typeof window !== 'undefined';

// Generic LocalStorage fallback helpers
export const localStore = {
  get: <T>(key: string, defaultValue: T): T => {
    if (!isClient) return defaultValue;
    try {
      const item = localStorage.getItem(`gastos_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage for ${key}:`, e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (!isClient) return;
    try {
      localStorage.setItem(`gastos_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage for ${key}:`, e);
    }
  }
};

// Helper to recursively remove undefined values so Firestore never rejects them
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Firestore services with graceful fallback
export const firestoreService = {
  // Save or update an expense
  saveExpense: async (expense: Expense): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.EXPENSES, expense.id);
      await setDoc(ref, sanitizeForFirestore(expense), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice (falling back locally):', err);
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.EXPENSES, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Save or update a workday record
  saveWorkDay: async (workDay: WorkDayIncome): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.WORK_DAYS, workDay.id);
      await setDoc(ref, sanitizeForFirestore(workDay), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  // Batch save multiple workdays
  saveWorkDaysBatch: async (workDays: WorkDayIncome[]): Promise<void> => {
    try {
      await Promise.all(workDays.map(day => {
        const ref = doc(db, COLLECTIONS.WORK_DAYS, day.id);
        return setDoc(ref, sanitizeForFirestore(day), { merge: true });
      }));
    } catch (err) {
      console.warn('Firestore batch write notice:', err);
    }
  },

  deleteWorkDay: async (id: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.WORK_DAYS, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Save extra income
  saveExtraIncome: async (income: ExtraIncome): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.EXTRA_INCOMES, income.id);
      await setDoc(ref, sanitizeForFirestore(income), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  deleteExtraIncome: async (id: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.EXTRA_INCOMES, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Recurring expenses
  saveRecurringExpense: async (item: RecurringExpense): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.RECURRING_EXPENSES, item.id);
      await setDoc(ref, sanitizeForFirestore(item), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  deleteRecurringExpense: async (id: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.RECURRING_EXPENSES, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Piggy banks
  savePiggyBank: async (bank: PiggyBank): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.PIGGY_BANKS, bank.id);
      await setDoc(ref, sanitizeForFirestore(bank), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  deletePiggyBank: async (id: string): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.PIGGY_BANKS, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Budgets
  saveBudget: async (budget: CategoryBudget): Promise<void> => {
    try {
      const ref = doc(db, COLLECTIONS.BUDGETS, budget.categoryId);
      await setDoc(ref, sanitizeForFirestore(budget), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  // Try to load all data from Firestore if available
  fetchAllData: async () => {
    try {
      const [expSnap, workSnap, extraSnap, recSnap, piggySnap, budgetSnap] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.EXPENSES), orderBy('date', 'desc'))),
        getDocs(query(collection(db, COLLECTIONS.WORK_DAYS), orderBy('date', 'desc'))),
        getDocs(query(collection(db, COLLECTIONS.EXTRA_INCOMES), orderBy('date', 'desc'))),
        getDocs(collection(db, COLLECTIONS.RECURRING_EXPENSES)),
        getDocs(collection(db, COLLECTIONS.PIGGY_BANKS)),
        getDocs(collection(db, COLLECTIONS.BUDGETS))
      ]);

      return {
        expenses: expSnap.docs.map(d => d.data() as Expense),
        workDays: workSnap.docs.map(d => d.data() as WorkDayIncome),
        extraIncomes: extraSnap.docs.map(d => d.data() as ExtraIncome),
        recurringExpenses: recSnap.docs.map(d => d.data() as RecurringExpense),
        piggyBanks: piggySnap.docs.map(d => d.data() as PiggyBank),
        budgets: budgetSnap.docs.map(d => d.data() as CategoryBudget)
      };
    } catch (err) {
      console.info('Firestore initial fetch fallback to local cache:', err);
      return null;
    }
  }
};
