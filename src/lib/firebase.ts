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
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile, 
  User 
} from 'firebase/auth';
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
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore sub-collection names
export const COLLECTIONS = {
  EXPENSES: 'expenses',
  WORK_DAYS: 'work_days',
  EXTRA_INCOMES: 'extra_incomes',
  RECURRING_EXPENSES: 'recurring_expenses',
  PIGGY_BANKS: 'piggy_banks',
  BUDGETS: 'category_budgets',
} as const;

// Helper to check if running in browser
const isClient = typeof window !== 'undefined';

// User-scoped LocalStorage helpers
export const localStore = {
  getUser: <T>(userId: string, key: string, defaultValue: T): T => {
    if (!isClient || !userId) return defaultValue;
    try {
      const item = localStorage.getItem(`gastos_${userId}_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage for ${key}:`, e);
      return defaultValue;
    }
  },
  setUser: <T>(userId: string, key: string, value: T): void => {
    if (!isClient || !userId) return;
    try {
      localStorage.setItem(`gastos_${userId}_${key}`, JSON.stringify(value));
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

// User-scoped Firestore services
export const firestoreService = {
  // Save or update an expense for a specific user
  saveExpense: async (userId: string, expense: Expense): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.EXPENSES, expense.id);
      await setDoc(ref, sanitizeForFirestore(expense), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice (falling back locally):', err);
    }
  },

  deleteExpense: async (userId: string, id: string): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.EXPENSES, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Work days
  saveWorkDay: async (userId: string, workDay: WorkDayIncome): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.WORK_DAYS, workDay.id);
      await setDoc(ref, sanitizeForFirestore(workDay), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  saveWorkDaysBatch: async (userId: string, workDays: WorkDayIncome[]): Promise<void> => {
    if (!userId) return;
    try {
      await Promise.all(workDays.map(day => {
        const ref = doc(db, 'users', userId, COLLECTIONS.WORK_DAYS, day.id);
        return setDoc(ref, sanitizeForFirestore(day), { merge: true });
      }));
    } catch (err) {
      console.warn('Firestore batch write notice:', err);
    }
  },

  deleteWorkDay: async (userId: string, id: string): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.WORK_DAYS, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Extra incomes
  saveExtraIncome: async (userId: string, income: ExtraIncome): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.EXTRA_INCOMES, income.id);
      await setDoc(ref, sanitizeForFirestore(income), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  deleteExtraIncome: async (userId: string, id: string): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.EXTRA_INCOMES, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Recurring expenses
  saveRecurringExpense: async (userId: string, item: RecurringExpense): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.RECURRING_EXPENSES, item.id);
      await setDoc(ref, sanitizeForFirestore(item), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  deleteRecurringExpense: async (userId: string, id: string): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.RECURRING_EXPENSES, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Piggy banks
  savePiggyBank: async (userId: string, bank: PiggyBank): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.PIGGY_BANKS, bank.id);
      await setDoc(ref, sanitizeForFirestore(bank), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  deletePiggyBank: async (userId: string, id: string): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.PIGGY_BANKS, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // Budgets
  saveBudget: async (userId: string, budget: CategoryBudget): Promise<void> => {
    if (!userId) return;
    try {
      const ref = doc(db, 'users', userId, COLLECTIONS.BUDGETS, budget.categoryId);
      await setDoc(ref, sanitizeForFirestore(budget), { merge: true });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }
  },

  // Fetch all user-scoped data from Firestore
  fetchAllData: async (userId: string) => {
    if (!userId) return null;
    try {
      const [expSnap, workSnap, extraSnap, recSnap, piggySnap, budgetSnap] = await Promise.all([
        getDocs(query(collection(db, 'users', userId, COLLECTIONS.EXPENSES), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'users', userId, COLLECTIONS.WORK_DAYS), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'users', userId, COLLECTIONS.EXTRA_INCOMES), orderBy('date', 'desc'))),
        getDocs(collection(db, 'users', userId, COLLECTIONS.RECURRING_EXPENSES)),
        getDocs(collection(db, 'users', userId, COLLECTIONS.PIGGY_BANKS)),
        getDocs(collection(db, 'users', userId, COLLECTIONS.BUDGETS))
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
