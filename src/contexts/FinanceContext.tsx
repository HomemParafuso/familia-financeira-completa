
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Transaction, Category, Budget, FinancialSummary } from '@/types/finance';
import { mockTransactions, mockCategories, mockBudgets } from '@/mockData';
import { toast } from 'sonner';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  summary: FinancialSummary | null;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTransactions(mockTransactions);
        setCategories(mockCategories);
        setBudgets(mockBudgets);
        
        // Calculate summary
        calculateSummary(mockTransactions);
      } catch (error) {
        console.error('Error loading finance data:', error);
        toast.error('Erro ao carregar dados financeiros');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calculate financial summary
  const calculateSummary = (transactionList: Transaction[]) => {
    const totalIncome = transactionList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactionList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Group by month for monthly summary (simplified)
    const monthsData = new Map<string, {income: number, expenses: number}>();
    
    transactionList.forEach(t => {
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
    
    transactionList
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

    setSummary({
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      monthlySummary,
      categorySummary
    });
  };

  // Transactions CRUD
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: `t${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    calculateSummary(updatedTransactions);
    toast.success('Transação adicionada com sucesso!');
  };

  const updateTransaction = (transaction: Transaction) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transaction.id 
        ? { ...transaction, updatedAt: new Date().toISOString() } 
        : t
    );
    
    setTransactions(updatedTransactions);
    calculateSummary(updatedTransactions);
    toast.success('Transação atualizada com sucesso!');
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    calculateSummary(updatedTransactions);
    toast.success('Transação excluída com sucesso!');
  };

  // Categories CRUD
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `c${Date.now()}`
    };
    
    setCategories([...categories, newCategory]);
    toast.success('Categoria adicionada com sucesso!');
  };

  const updateCategory = (category: Category) => {
    setCategories(categories.map(c => c.id === category.id ? category : c));
    toast.success('Categoria atualizada com sucesso!');
  };

  const deleteCategory = (id: string) => {
    // Check if category is in use
    if (transactions.some(t => t.categoryId === id)) {
      toast.error('Esta categoria está em uso e não pode ser excluída');
      return;
    }
    
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Categoria excluída com sucesso!');
  };

  // Budgets CRUD
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b${Date.now()}`
    };
    
    setBudgets([...budgets, newBudget]);
    toast.success('Orçamento adicionado com sucesso!');
  };

  const updateBudget = (budget: Budget) => {
    setBudgets(budgets.map(b => b.id === budget.id ? budget : b));
    toast.success('Orçamento atualizado com sucesso!');
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
    toast.success('Orçamento excluído com sucesso!');
  };

  // Helper functions
  const getTransactionsByCategory = (categoryId: string) => {
    return transactions.filter(t => t.categoryId === categoryId);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        summary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        getTransactionsByCategory,
        isLoading
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
