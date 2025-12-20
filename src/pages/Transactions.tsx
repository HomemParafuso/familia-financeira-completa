import { useState } from 'react';
import { Plus, Filter, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction, TransactionType, ExpenseGroup } from '@/types/database';

export default function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>();
  const [defaultType, setDefaultType] = useState<TransactionType>('expense');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | ExpenseGroup>('all');

  const currentYear = new Date().getFullYear();
  const { data: transactions = [], isLoading } = useTransactions(currentYear);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterGroup !== 'all' && t.expense_group !== filterGroup) return false;
    return true;
  });

  const revenues = transactions.filter((t) => t.type === 'revenue');
  const expenses = transactions.filter((t) => t.type === 'expense');

  const handleNewTransaction = (type: TransactionType) => {
    setDefaultType(type);
    setEditTransaction(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setDialogOpen(true);
  };

  return (
    <AuthGuard requireFamily>
      <AppLayout title="Lançamentos">
        <div className="space-y-6 animate-fade-in">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => handleNewTransaction('revenue')}
                className="bg-revenue hover:bg-revenue/90"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
              <Button
                onClick={() => handleNewTransaction('expense')}
                className="bg-expense hover:bg-expense/90"
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </div>

            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(v) => setFilterType(v as typeof filterType)}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="revenue">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              {filterType !== 'revenue' && (
                <Select
                  value={filterGroup}
                  onValueChange={(v) => setFilterGroup(v as typeof filterGroup)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="basic">Básicas</SelectItem>
                    <SelectItem value="financing">Financiamentos</SelectItem>
                    <SelectItem value="eventual">Eventuais</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Todos ({transactions.length})
              </TabsTrigger>
              <TabsTrigger value="revenue" className="text-revenue">
                Receitas ({revenues.length})
              </TabsTrigger>
              <TabsTrigger value="expense" className="text-expense">
                Despesas ({expenses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TransactionList
                transactions={filteredTransactions}
                isLoading={isLoading}
                onEdit={handleEdit}
              />
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <TransactionList
                transactions={revenues}
                isLoading={isLoading}
                onEdit={handleEdit}
              />
            </TabsContent>

            <TabsContent value="expense" className="mt-4">
              <TransactionList
                transactions={expenses.filter(
                  (t) => filterGroup === 'all' || t.expense_group === filterGroup
                )}
                isLoading={isLoading}
                onEdit={handleEdit}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Form Dialog */}
        <TransactionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transaction={editTransaction}
          defaultType={defaultType}
        />
      </AppLayout>
    </AuthGuard>
  );
}
