export type Person = 'Marwan' | 'Siham' | 'Loujain' | 'Lwalida' | 'Lwalid' | 'Otros';

export interface CategoryItem {
  id: string;
  name: string;
  subcategories: string[];
  iconName: string;
  isNonEssential?: boolean; // Used for money-leak audits and work-hour conversion
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  person: Person;
  categoryId: string;
  subcategory?: string;
  notes?: string;
  createdAt: number;
}

export interface WorkDayIncome {
  id: string;
  date: string; // YYYY-MM-DD
  puenteSurHours: number; // 7.50 €/h
  sergioHours: number;    // 8.50 €/h
  isOff: boolean;         // "No trabajado" switch
  notes?: string;
  totalEarned: number;
  confirmedAt: number;
}

export interface ExtraIncome {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  person: Person;
  createdAt: number;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  dayOfMonth: number; // 1-31
  categoryId: string;
  person: Person;
  active: boolean;
  notes?: string;
}

export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  categoryId: string;
  notes?: string;
}

export interface CategoryBudget {
  categoryId: string;
  monthlyLimit: number;
}

export interface AuditAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  equivalentHours?: number;
  amount?: number;
  categoryName?: string;
}

export interface FilterState {
  search: string;
  person: Person | 'ALL';
  categoryId: string | 'ALL';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
