
import { Budget } from '@/types/finance';
import { toast } from 'sonner';

// Constante para guardar a chave do localStorage
const STORAGE_KEY = 'finance_budgets';

// Função para carregar orçamentos do localStorage
const loadBudgets = (): Budget[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading budgets from localStorage', error);
    return [];
  }
};

// Função para salvar orçamentos no localStorage
const saveBudgets = (budgets: Budget[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets to localStorage', error);
  }
};

// Add a new budget
export const addBudget = (
  budgets: Budget[], 
  budget: Omit<Budget, 'id'>
): Budget[] => {
  const now = new Date().toISOString();
  const newBudget: Budget = {
    ...budget,
    id: `b${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  
  const result = [...budgets, newBudget];
  saveBudgets(result);
  toast.success('Orçamento adicionado com sucesso!');
  return result;
};

// Update an existing budget
export const updateBudget = (
  budgets: Budget[], 
  updatedBudget: Budget
): Budget[] => {
  const result = budgets.map(b => 
    b.id === updatedBudget.id 
      ? { ...updatedBudget, updatedAt: new Date().toISOString() } 
      : b
  );
  
  saveBudgets(result);
  toast.success('Orçamento atualizado com sucesso!');
  return result;
};

// Delete a budget
export const deleteBudget = (
  budgets: Budget[], 
  budgetId: string
): Budget[] => {
  const result = budgets.filter(b => b.id !== budgetId);
  saveBudgets(result);
  toast.success('Orçamento excluído com sucesso!');
  return result;
};

// Inicializar orçamentos a partir do localStorage
export const initializeBudgets = (): Budget[] => {
  return loadBudgets();
};
