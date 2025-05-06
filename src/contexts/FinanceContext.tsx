
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Transaction, Category, Budget, FinancialSummary, FinancialForecast } from '@/types/finance';
import { loadInitialFinanceData } from '@/services/financeService';
import { useFinanceActions } from '@/hooks/useFinanceActions';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  summary: FinancialSummary | null;
  forecast: FinancialForecast | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<{
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
  }>({
    transactions: [],
    categories: [],
    budgets: []
  });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await loadInitialFinanceData();
      setInitialData(data);
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  // Initialize actions from the custom hook
  const financeActions = useFinanceActions(initialData);

  return (
    <FinanceContext.Provider
      value={{
        ...financeActions,
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
