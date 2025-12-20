import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { Transaction, TransactionType, ExpenseGroup, RecurrenceType } from '@/types/database';

const transactionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['revenue', 'expense']),
  expense_group: z.enum(['basic', 'financing', 'eventual']).optional(),
  category_id: z.string().optional(),
  due_date: z.date(),
  recurrence_type: z.enum(['none', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom']),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_end_date: z.date().optional(),
  recurrence_count: z.number().min(1).optional(),
  notify_on_due: z.boolean().optional(),
  notify_days_before: z.number().min(1).max(30).optional(),
});

type FormData = z.infer<typeof transactionSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  defaultType?: TransactionType;
}

const expenseGroupLabels: Record<ExpenseGroup, string> = {
  basic: 'Básica',
  financing: 'Financiamento',
  eventual: 'Eventual',
};

const recurrenceLabels: Record<RecurrenceType, string> = {
  none: 'Sem recorrência',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  yearly: 'Anual',
  custom: 'Personalizada',
};

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultType = 'expense',
}: TransactionFormDialogProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction?.type || defaultType
  );

  const { data: categories = [] } = useCategories(transactionType);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const form = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: transaction?.name || '',
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      type: transaction?.type || defaultType,
      expense_group: transaction?.expense_group || 'basic',
      category_id: transaction?.category_id || undefined,
      due_date: transaction?.due_date ? new Date(transaction.due_date) : new Date(),
      recurrence_type: transaction?.recurrence_type || 'none',
      recurrence_interval: transaction?.recurrence_interval || 1,
      notify_on_due: transaction?.notify_on_due || false,
      notify_days_before: transaction?.notify_days_before || 3,
    },
  });

  const watchType = form.watch('type');
  const watchRecurrence = form.watch('recurrence_type');

  const onSubmit = async (data: FormData) => {
    try {
      if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          data: data as Partial<FormData>,
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          amount: data.amount,
          type: data.type,
          due_date: data.due_date,
          recurrence_type: data.recurrence_type,
          description: data.description,
          expense_group: data.expense_group,
          category_id: data.category_id,
          recurrence_interval: data.recurrence_interval,
          recurrence_end_date: data.recurrence_end_date,
          recurrence_count: data.recurrence_count,
          notify_on_due: data.notify_on_due,
          notify_days_before: data.notify_days_before,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    form.setValue('type', type);
    form.setValue('category_id', undefined);
    if (type === 'revenue') {
      form.setValue('expense_group', undefined);
    } else {
      form.setValue('expense_group', 'basic');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={watchType === 'revenue' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  watchType === 'revenue' && 'bg-revenue hover:bg-revenue/90'
                )}
                onClick={() => handleTypeChange('revenue')}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={watchType === 'expense' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  watchType === 'expense' && 'bg-expense hover:bg-expense/90'
                )}
                onClick={() => handleTypeChange('expense')}
              >
                Despesa
              </Button>
            </div>

            {/* Expense group (only for expenses) */}
            {watchType === 'expense' && (
              <FormField
                control={form.control}
                name="expense_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo da Despesa *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(expenseGroupLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel, Salário..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due date */}
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurrence */}
            <FormField
              control={form.control}
              name="recurrence_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recorrência</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a recorrência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(recurrenceLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom interval */}
            {watchRecurrence === 'custom' && (
              <FormField
                control={form.control}
                name="recurrence_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo (dias)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* End date for recurrence */}
            {watchRecurrence !== 'none' && (
              <FormField
                control={form.control}
                name="recurrence_end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Final (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: ptBR })
                            ) : (
                              <span>Sem data final</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notification */}
            <FormField
              control={form.control}
              name="notify_on_due"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Notificar vencimento</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {transaction ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
