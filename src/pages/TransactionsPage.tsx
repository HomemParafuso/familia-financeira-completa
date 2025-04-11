
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/Dashboard';
import TransactionList from '@/components/finance/TransactionList';
import TransactionForm from '@/components/finance/TransactionForm';
import { Transaction } from '@/types/finance';
import { useGroup } from '@/contexts/GroupContext';
import { toast } from 'sonner';

interface LocationState {
  openAddDialog?: boolean;
}

const TransactionsPage: React.FC = () => {
  const { canUserPerform } = useGroup();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  
  // Get location state to check if we should open the add dialog
  const location = useLocation();
  const locationState = location.state as LocationState;

  // Check if user has permission to add transactions
  const canAddExpenses = canUserPerform('add_expenses');
  const canAddIncome = canUserPerform('add_income');
  const canAddTransactions = canAddExpenses || canAddIncome;

  // Open add dialog if navigated with state.openAddDialog = true
  useEffect(() => {
    if (locationState?.openAddDialog) {
      setIsAddOpen(true);
      // Clear the state to prevent dialog from reopening on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  const handleAddTransaction = () => {
    if (!canAddTransactions) {
      toast.error("Você não tem permissão para adicionar transações");
      return;
    }
    setIsAddOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
          <Button 
            className="bg-finance-primary hover:bg-finance-primary/90"
            onClick={handleAddTransaction}
          >
            <Plus className="mr-1 h-4 w-4" />
            Nova Transação
          </Button>
        </div>
        
        <TransactionList onEdit={handleEdit} />
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Transação</DialogTitle>
            <DialogDescription>
              Adicione uma nova transação à sua conta.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            onClose={() => setIsAddOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Altere os detalhes da transação selecionada.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            initialData={selectedTransaction} 
            onClose={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TransactionsPage;
