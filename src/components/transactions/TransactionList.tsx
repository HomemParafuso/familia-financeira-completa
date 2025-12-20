import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Transaction, ExpenseGroup } from '@/types/database';
import { useDeleteTransaction, useTogglePaid } from '@/hooks/useTransactions';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
}

const expenseGroupColors: Record<ExpenseGroup, string> = {
  basic: 'bg-expense-basic/10 text-expense-basic border-expense-basic/30',
  financing: 'bg-expense-financing/10 text-expense-financing border-expense-financing/30',
  eventual: 'bg-expense-eventual/10 text-expense-eventual border-expense-eventual/30',
};

const expenseGroupLabels: Record<ExpenseGroup, string> = {
  basic: 'Básica',
  financing: 'Financiamento',
  eventual: 'Eventual',
};

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
}: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteTransaction();
  const togglePaidMutation = useTogglePaid();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ id: deleteId });
      setDeleteId(null);
    }
  };

  const handleTogglePaid = async (id: string, currentStatus: boolean) => {
    await togglePaidMutation.mutateAsync({ id, isPaid: !currentStatus });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum lançamento encontrado.</p>
        <p className="text-sm">Crie seu primeiro lançamento para começar!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.type === 'revenue' ? (
                    <ArrowUpCircle className="h-5 w-5 text-revenue" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-expense" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.name}</span>
                    {transaction.recurrence_type !== 'none' && (
                      <Repeat className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {transaction.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {transaction.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(transaction.due_date), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {transaction.expense_group && (
                    <Badge
                      variant="outline"
                      className={cn(expenseGroupColors[transaction.expense_group])}
                    >
                      {expenseGroupLabels[transaction.expense_group]}
                    </Badge>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium tabular-nums',
                    transaction.type === 'revenue' ? 'text-revenue' : 'text-expense'
                  )}
                >
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(Number(transaction.amount))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      handleTogglePaid(transaction.id, transaction.is_paid)
                    }
                  >
                    {transaction.is_paid ? (
                      <Check className="h-4 w-4 text-revenue" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(transaction.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
