
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  createdBy: string;
  groupId?: string;
  tags?: string[];
  attachments?: string[];
  recurring?: RecurringConfig;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringConfig {
  frequency: RecurrencePeriod;
  months?: number; // Quantidade de meses para recorrência
  endDate?: string;
  lastProcessed?: string;
}

export type RecurrencePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  groupId?: string;
  parentId?: string;
  isDefault?: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  monthlySummary: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
  categorySummary: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface Budget {
  id: string;
  categoryId?: string; // Opcional para orçamentos globais
  memberId?: string;   // Opcional para orçamentos por membro
  isGlobal?: boolean;  // Indica se é um orçamento global para o grupo
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

export type ReportFormat = 'pdf' | 'excel' | 'ofx';

export interface FinancialForecast {
  currentMonth: {
    month: string;
    daysElapsed: number;
    totalDays: number;
    incomeToDate: number;
    expensesToDate: number;
    projectedIncome: number;
    projectedExpenses: number;
    projectedBalance: number;
    completionPercentage: number;
  };
  historicalData: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
  projectedMonths: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
    isProjected: boolean;
  }[];
  yearProjection: {
    year: number;
    incomeToDate: number;
    expensesToDate: number;
    projectedIncome: number;
    projectedExpenses: number;
    projectedBalance: number;
  };
  categoriesTrend: {
    category: string;
    currentAmount: number;
    projectedAmount: number;
    trend: number;
  }[];
}
