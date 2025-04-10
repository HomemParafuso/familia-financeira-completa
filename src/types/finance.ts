
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
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: string;
  lastProcessed?: string;
}

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
  categoryId: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}
