import { Expense, WorkDayIncome, ExtraIncome, Person, CategoryItem, CategoryBudget, AuditAlert } from '../types';
import { HOURLY_RATES, PEOPLE, CATEGORIES } from './constants';

/**
 * Calculates earnings for a single workday
 */
export function calculateDailyWorkIncome(
  puenteSurHours: number,
  sergioHours: number,
  isOff: boolean
): number {
  if (isOff) return 0;
  const puenteSurEarned = (Number(puenteSurHours) || 0) * HOURLY_RATES.PUENTE_SUR;
  const sergioEarned = (Number(sergioHours) || 0) * HOURLY_RATES.SERGIO;
  return Number((puenteSurEarned + sergioEarned).toFixed(2));
}

/**
 * Psychological conversion: Translates a monetary expense into working hours
 */
export function calculateHoursEquivalent(amount: number, hourlyRate: number = HOURLY_RATES.WEIGHTED_AVERAGE): {
  hours: number;
  workDays: number;
  formattedText: string;
} {
  if (amount <= 0 || hourlyRate <= 0) {
    return { hours: 0, workDays: 0, formattedText: '0 h' };
  }
  const hours = Number((amount / hourlyRate).toFixed(1));
  const workDays = Number((hours / 8).toFixed(1));
  
  let formattedText = `${hours} h`;
  if (workDays >= 1) {
    formattedText += ` (~${workDays} jornada${workDays > 1 ? 's' : ''})`;
  }

  return { hours, workDays, formattedText };
}

/**
 * Formats currency to EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Checks if a given date (YYYY-MM-DD) is a weekday (Monday to Friday)
 */
export function isWeekday(dateString: string): boolean {
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Finds all weekdays between two dates (inclusive) that do not have confirmed work records
 */
export function getPendingWeekdays(
  startDateStr: string,
  endDateStr: string,
  existingWorkDays: WorkDayIncome[]
): string[] {
  const existingDates = new Set(existingWorkDays.map(w => w.date));
  const pending: string[] = [];

  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

  const current = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      if (!existingDates.has(dateKey)) {
        pending.push(dateKey);
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return pending;
}

export interface CrossMatrixRow {
  category: CategoryItem;
  personAmounts: Record<Person, number>;
  totalCategory: number;
}

export interface CrossMatrixData {
  rows: CrossMatrixRow[];
  personTotals: Record<Person, number>;
  grandTotal: number;
}

/**
 * Builds the dynamic cross matrix (Persona x Categoría pivot table)
 */
export function buildCrossMatrix(
  expenses: Expense[],
  categories: CategoryItem[] = CATEGORIES
): CrossMatrixData {
  const personTotals: Record<Person, number> = {
    Marwan: 0,
    Siham: 0,
    Loujain: 0,
    Lwalida: 0,
    Lwalid: 0,
    Otros: 0,
  };

  let grandTotal = 0;

  // Map of categoryId -> Record<Person, number>
  const catMap = new Map<string, Record<Person, number>>();

  categories.forEach(cat => {
    catMap.set(cat.id, {
      Marwan: 0,
      Siham: 0,
      Loujain: 0,
      Lwalida: 0,
      Lwalid: 0,
      Otros: 0,
    });
  });

  expenses.forEach(exp => {
    const p = exp.person;
    const cat = catMap.get(exp.categoryId);
    const amount = Number(exp.amount) || 0;

    if (cat && p && cat[p] !== undefined) {
      cat[p] += amount;
    }
    if (personTotals[p] !== undefined) {
      personTotals[p] += amount;
    }
    grandTotal += amount;
  });

  const rows: CrossMatrixRow[] = categories.map(cat => {
    const pAmounts = catMap.get(cat.id)!;
    const totalCategory = Object.values(pAmounts).reduce((acc, v) => acc + v, 0);

    return {
      category: cat,
      personAmounts: pAmounts,
      totalCategory: Number(totalCategory.toFixed(2)),
    };
  });

  // Round person totals
  (Object.keys(personTotals) as Person[]).forEach(k => {
    personTotals[k] = Number(personTotals[k].toFixed(2));
  });

  return {
    rows,
    personTotals,
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

/**
 * Generates smart savings audit alerts and psychologically framed insights
 */
export function generateSmartAudit(
  expenses: Expense[],
  budgets: CategoryBudget[],
  categories: CategoryItem[] = CATEGORIES
): {
  alerts: AuditAlert[];
  nonEssentialTotal: number;
  nonEssentialHours: number;
  topMoneyLeakCategory?: { name: string; amount: number; hours: number };
} {
  const alerts: AuditAlert[] = [];
  const categoryTotals: Record<string, number> = {};

  let nonEssentialTotal = 0;

  expenses.forEach(exp => {
    categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + (Number(exp.amount) || 0);
  });

  // Calculate non-essential spending
  const nonEssentialCatMap = new Map<string, CategoryItem>();
  categories.forEach(c => {
    if (c.isNonEssential) nonEssentialCatMap.set(c.id, c);
  });

  let topNonEssentialAmount = 0;
  let topNonEssentialCat: CategoryItem | undefined;

  Object.entries(categoryTotals).forEach(([catId, amount]) => {
    const cat = nonEssentialCatMap.get(catId);
    if (cat) {
      nonEssentialTotal += amount;
      if (amount > topNonEssentialAmount) {
        topNonEssentialAmount = amount;
        topNonEssentialCat = cat;
      }
    }
  });

  const nonEssentialEquiv = calculateHoursEquivalent(nonEssentialTotal);

  // Budget threshold checks
  budgets.forEach(b => {
    const spent = categoryTotals[b.categoryId] || 0;
    const cat = categories.find(c => c.id === b.categoryId);
    const catName = cat ? cat.name : b.categoryId;

    if (spent >= b.monthlyLimit) {
      const over = spent - b.monthlyLimit;
      const hoursOver = calculateHoursEquivalent(over);
      alerts.push({
        id: `budget-exceeded-${b.categoryId}`,
        type: 'danger',
        title: `Límite superado en ${catName}`,
        message: `Has gastado ${formatCurrency(spent)} de un presupuesto de ${formatCurrency(b.monthlyLimit)} (exceso de ${formatCurrency(over)}).`,
        equivalentHours: hoursOver.hours,
        amount: spent,
        categoryName: catName,
      });
    } else if (spent >= b.monthlyLimit * 0.8) {
      alerts.push({
        id: `budget-warning-${b.categoryId}`,
        type: 'warning',
        title: `Alerta preventiva: ${catName} al ${Math.round((spent / b.monthlyLimit) * 100)}%`,
        message: `Llevas consumido el ${Math.round((spent / b.monthlyLimit) * 100)}% (${formatCurrency(spent)} / ${formatCurrency(b.monthlyLimit)}).`,
        amount: spent,
        categoryName: catName,
      });
    }
  });

  // Non-essential psychological alert
  if (nonEssentialTotal > 100) {
    alerts.push({
      id: 'leak-non-essential-high',
      type: 'warning',
      title: 'Fuga de dinero detectada en Gastos No Esenciales',
      message: `Llevas acumulados ${formatCurrency(nonEssentialTotal)} en ocio, comer fuera, compras y caprichos.`,
      equivalentHours: nonEssentialEquiv.hours,
      amount: nonEssentialTotal,
    });
  }

  // Eating out specific check
  const comerFueraSpent = categoryTotals['comer_fuera'] || 0;
  if (comerFueraSpent > 100) {
    const equiv = calculateHoursEquivalent(comerFueraSpent);
    alerts.push({
      id: 'leak-comer-fuera',
      type: 'info',
      title: 'Coste en horas: Comer fuera y cafeterías',
      message: `${formatCurrency(comerFueraSpent)} en restaurantes y cafeterías equivalen a ${equiv.formattedText} de trabajo.`,
      equivalentHours: equiv.hours,
      amount: comerFueraSpent,
      categoryName: 'Comer fuera',
    });
  }

  const topMoneyLeakCategory = topNonEssentialCat ? {
    name: topNonEssentialCat.name,
    amount: topNonEssentialAmount,
    hours: calculateHoursEquivalent(topNonEssentialAmount).hours
  } : undefined;

  return {
    alerts,
    nonEssentialTotal: Number(nonEssentialTotal.toFixed(2)),
    nonEssentialHours: nonEssentialEquiv.hours,
    topMoneyLeakCategory
  };
}
