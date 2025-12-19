import { useMemo } from 'react';
import { Transaction, MonthlyProjection, AnnualProjection, RecurrenceType } from '@/types/database';
import { 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  format, 
  addDays, 
  addWeeks, 
  addMonths, 
  addYears,
  isSameMonth,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectedTransaction {
  originalId: string;
  date: Date;
  amount: number;
  type: 'revenue' | 'expense';
  expenseGroup: 'basic' | 'financing' | 'eventual' | null;
  name: string;
  isRecurring: boolean;
  recurrenceIndex: number;
}

function getNextDate(
  currentDate: Date,
  recurrenceType: RecurrenceType,
  interval: number = 1
): Date {
  switch (recurrenceType) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'biweekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'yearly':
      return addYears(currentDate, 1);
    case 'custom':
      return addDays(currentDate, interval);
    default:
      return currentDate;
  }
}

function generateProjectedTransactions(
  transaction: Transaction,
  yearStart: Date,
  yearEnd: Date
): ProjectedTransaction[] {
  const projections: ProjectedTransaction[] = [];
  const dueDate = parseISO(transaction.due_date);
  
  // Non-recurring transaction
  if (transaction.recurrence_type === 'none') {
    if (isWithinInterval(dueDate, { start: yearStart, end: yearEnd })) {
      projections.push({
        originalId: transaction.id,
        date: dueDate,
        amount: Number(transaction.amount),
        type: transaction.type,
        expenseGroup: transaction.expense_group,
        name: transaction.name,
        isRecurring: false,
        recurrenceIndex: 0,
      });
    }
    return projections;
  }

  // Recurring transaction
  const startDate = transaction.recurrence_start_date 
    ? parseISO(transaction.recurrence_start_date) 
    : dueDate;
  const endDate = transaction.recurrence_end_date 
    ? parseISO(transaction.recurrence_end_date) 
    : yearEnd;
  const maxCount = transaction.recurrence_count || Infinity;

  let currentDate = startDate;
  let index = 0;

  while (currentDate <= endDate && currentDate <= yearEnd && index < maxCount) {
    if (currentDate >= yearStart) {
      projections.push({
        originalId: transaction.id,
        date: currentDate,
        amount: Number(transaction.amount),
        type: transaction.type,
        expenseGroup: transaction.expense_group,
        name: transaction.name,
        isRecurring: true,
        recurrenceIndex: index,
      });
    }

    currentDate = getNextDate(
      currentDate,
      transaction.recurrence_type,
      transaction.recurrence_interval || 1
    );
    index++;
  }

  return projections;
}

export function useFinancialProjection(
  transactions: Transaction[],
  year: number = new Date().getFullYear()
): AnnualProjection {
  return useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    // Generate all projected transactions for the year
    const allProjections: ProjectedTransaction[] = [];
    
    transactions.forEach(transaction => {
      const projections = generateProjectedTransactions(transaction, yearStart, yearEnd);
      allProjections.push(...projections);
    });

    // Calculate monthly projections
    let accumulatedBalance = 0;
    const monthlyProjections: MonthlyProjection[] = months.map((monthDate, index) => {
      const monthTransactions = allProjections.filter(p => 
        isSameMonth(p.date, monthDate)
      );

      const revenues = monthTransactions
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);

      const basicExpenses = monthTransactions
        .filter(t => t.type === 'expense' && t.expenseGroup === 'basic')
        .reduce((sum, t) => sum + t.amount, 0);

      const financingExpenses = monthTransactions
        .filter(t => t.type === 'expense' && t.expenseGroup === 'financing')
        .reduce((sum, t) => sum + t.amount, 0);

      const eventualExpenses = monthTransactions
        .filter(t => t.type === 'expense' && t.expenseGroup === 'eventual')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = basicExpenses + financingExpenses + eventualExpenses;
      const balance = revenues - expenses;
      accumulatedBalance += balance;

      return {
        month: index + 1,
        year,
        monthName: format(monthDate, 'MMM', { locale: ptBR }),
        revenues,
        expenses,
        basicExpenses,
        financingExpenses,
        eventualExpenses,
        balance,
        accumulatedBalance,
      };
    });

    // Calculate annual totals
    const totalRevenues = monthlyProjections.reduce((sum, m) => sum + m.revenues, 0);
    const totalExpenses = monthlyProjections.reduce((sum, m) => sum + m.expenses, 0);
    const totalBasicExpenses = monthlyProjections.reduce((sum, m) => sum + m.basicExpenses, 0);
    const totalFinancingExpenses = monthlyProjections.reduce((sum, m) => sum + m.financingExpenses, 0);
    const totalEventualExpenses = monthlyProjections.reduce((sum, m) => sum + m.eventualExpenses, 0);

    return {
      year,
      totalRevenues,
      totalExpenses,
      totalBasicExpenses,
      totalFinancingExpenses,
      totalEventualExpenses,
      annualBalance: totalRevenues - totalExpenses,
      monthlyProjections,
    };
  }, [transactions, year]);
}
