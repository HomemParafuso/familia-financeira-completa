
import React, { useState } from 'react';
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

const TransactionsPage: React.FC = () => {
  const { canUserPerform } = useGroup();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
          <Button 
            className="bg-finance-primary hover:bg-finance-primary/90"
            onClick={() => setIsAddOpen(true)}
            disabled={!canUserPerform('add_expenses') && !canUserPerform('add_income')}
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
