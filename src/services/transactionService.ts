
import { Transaction } from '@/types/finance';
import { toast } from 'sonner';

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
  
  toast.success('Transação atualizada com sucesso!');
  return result;
};

// Delete a transaction
export const deleteTransaction = (
  transactions: Transaction[], 
  transactionId: string
): Transaction[] => {
  const result = transactions.filter(t => t.id !== transactionId);
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
