
import { useState, useCallback, useEffect } from 'react';
import { Transaction, Category, Budget, FinancialSummary, FinancialForecast } from '@/types/finance';
import { 
  addTransaction as addTransactionService, 
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  getTransactionsByCategory as getTransactionsByCategoryService
} from '@/services/transactionService';
import { 
  addCategory as addCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService
} from '@/services/categoryService';
import {
  addBudget as addBudgetService,
  updateBudget as updateBudgetService,
  deleteBudget as deleteBudgetService
} from '@/services/budgetService';
import { 
  calculateFinancialSummary,
  calculateFinancialForecast
} from '@/services/financeService';

export const useFinanceActions = (initialData: {
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[]
}) => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [budgets, setBudgets] = useState<Budget[]>(initialData.budgets);
  const [summary, setSummary] = useState<FinancialSummary | null>(
    calculateFinancialSummary(initialData.transactions, initialData.categories)
  );
  const [forecast, setForecast] = useState<FinancialForecast | null>(
    calculateFinancialForecast(initialData.transactions, initialData.categories)
  );

  // Update summary when transactions or categories change
  useEffect(() => {
    setSummary(calculateFinancialSummary(transactions, categories));
    setForecast(calculateFinancialForecast(transactions, categories));
  }, [transactions, categories]);

  // Transaction actions
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updatedTransactions = addTransactionService(transactions, transaction);
    setTransactions(updatedTransactions);
  }, [transactions]);

  const updateTransaction = useCallback((transaction: Transaction) => {
    const updatedTransactions = updateTransactionService(transactions, transaction);
    setTransactions(updatedTransactions);
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    const updatedTransactions = deleteTransactionService(transactions, id);
    setTransactions(updatedTransactions);
  }, [transactions]);

  // Category actions
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const updatedCategories = addCategoryService(categories, category);
    setCategories(updatedCategories);
  }, [categories]);

  const updateCategory = useCallback((category: Category) => {
    const updatedCategories = updateCategoryService(categories, category);
    setCategories(updatedCategories);
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const result = deleteCategoryService(categories, transactions, id);
    if (result.success) {
      setCategories(result.categories);
    }
  }, [categories, transactions]);

  // Budget actions
  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const updatedBudgets = addBudgetService(budgets, budget);
    setBudgets(updatedBudgets);
  }, [budgets]);

  const updateBudget = useCallback((budget: Budget) => {
    const updatedBudgets = updateBudgetService(budgets, budget);
    setBudgets(updatedBudgets);
  }, [budgets]);

  const deleteBudget = useCallback((id: string) => {
    const updatedBudgets = deleteBudgetService(budgets, id);
    setBudgets(updatedBudgets);
  }, [budgets]);

  // Helper functions
  const getTransactionsByCategory = useCallback((categoryId: string) => {
    return getTransactionsByCategoryService(transactions, categoryId);
  }, [transactions]);

  return {
    // State
    transactions,
    categories,
    budgets,
    summary,
    forecast,
    
    // Transaction actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Category actions
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Budget actions
    addBudget,
    updateBudget,
    deleteBudget,
    
    // Helper functions
    getTransactionsByCategory
  };
};
