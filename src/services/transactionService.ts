
import { Transaction } from '@/types/finance';
import { toast } from 'sonner';

// Constante para guardar a chave do localStorage
const STORAGE_KEY = 'finance_transactions';

// Função para carregar transações do localStorage
const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading transactions from localStorage', error);
    return [];
  }
};

// Função para salvar transações no localStorage
const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage', error);
  }
};

// Add a new transaction
export const addTransaction = (
  transactions: Transaction[], 
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Transaction[] => {
  const now = new Date().toISOString();
  const newTransaction: Transaction = {
    ...transaction,
    id: `t${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  
  const result = [...transactions, newTransaction];
  saveTransactions(result);
  toast.success('Transação adicionada com sucesso!');
  return result;
};

// Update an existing transaction
export const updateTransaction = (
  transactions: Transaction[], 
  updatedTransaction: Transaction
): Transaction[] => {
  const result = transactions.map(t => 
    t.id === updatedTransaction.id 
      ? { ...updatedTransaction, updatedAt: new Date().toISOString() } 
      : t
  );
  
  saveTransactions(result);
  toast.success('Transação atualizada com sucesso!');
  return result;
};

// Delete a transaction
export const deleteTransaction = (
  transactions: Transaction[], 
  transactionId: string
): Transaction[] => {
  const result = transactions.filter(t => t.id !== transactionId);
  saveTransactions(result);
  toast.success('Transação excluída com sucesso!');
  return result;
};

// Get transactions by category
export const getTransactionsByCategory = (
  transactions: Transaction[], 
  categoryId: string
): Transaction[] => {
  return transactions.filter(t => t.categoryId === categoryId);
};

// Inicializar transações a partir do localStorage
export const initializeTransactions = (): Transaction[] => {
  return loadTransactions();
};
