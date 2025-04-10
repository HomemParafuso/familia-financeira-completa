
import { Budget } from '@/types/finance';
import { toast } from 'sonner';

// Add a new budget
export const addBudget = (
  budgets: Budget[], 
  budget: Omit<Budget, 'id'>
): Budget[] => {
  const newBudget: Budget = {
    ...budget,
    id: `b${Date.now()}`
  };
  
  toast.success('Orçamento adicionado com sucesso!');
  return [...budgets, newBudget];
};

// Update an existing budget
export const updateBudget = (
  budgets: Budget[], 
  updatedBudget: Budget
): Budget[] => {
  const result = budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b);
  toast.success('Orçamento atualizado com sucesso!');
  return result;
};

// Delete a budget
export const deleteBudget = (
  budgets: Budget[], 
  budgetId: string
): Budget[] => {
  const result = budgets.filter(b => b.id !== budgetId);
  toast.success('Orçamento excluído com sucesso!');
  return result;
};
