
import { Transaction, Category, Budget, FinancialSummary } from '@/types/finance';
import { mockTransactions, mockCategories, mockBudgets } from '@/mockData';
import { toast } from 'sonner';

// Load initial finance data
export const loadInitialFinanceData = async () => {
  try {
    // In a real app, this would be API calls
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transactions = mockTransactions;
    const categories = mockCategories;
    const budgets = mockBudgets;
    
    return { transactions, categories, budgets };
  } catch (error) {
    console.error('Error loading finance data:', error);
    toast.error('Erro ao carregar dados financeiros');
    return { transactions: [], categories: [], budgets: [] };
  }
};

// Calculate financial summary
export const calculateFinancialSummary = (transactions: Transaction[], categories: Category[]): FinancialSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Group by month for monthly summary (simplified)
  const monthsData = new Map<string, {income: number, expenses: number}>();
  
  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
    if (!monthsData.has(month)) {
      monthsData.set(month, { income: 0, expenses: 0 });
    }
    
    const data = monthsData.get(month)!;
    if (t.type === 'income') {
      data.income += t.amount;
    } else {
      data.expenses += t.amount;
    }
  });
  
  const monthlySummary = Array.from(monthsData.entries()).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    balance: data.income - data.expenses
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate category summary for expenses
  const categoryData = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
      categoryData.set(
        categoryName, 
        (categoryData.get(categoryName) || 0) + t.amount
      );
    });
  
  const categorySummary = Array.from(categoryData.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    monthlySummary,
    categorySummary
  };
};
