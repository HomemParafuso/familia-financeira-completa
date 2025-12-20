import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, TransactionFormData, RecurrenceEditScope } from '@/types/database';
import { toast } from 'sonner';
import { addWeeks, addMonths, addYears, addDays, format } from 'date-fns';

export function useTransactions(year?: number) {
  const { family } = useAuth();
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['transactions', family?.id, currentYear],
    queryFn: async () => {
      if (!family?.id) return [];

      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('family_id', family.id)
        .or(`due_date.gte.${startDate},recurrence_type.neq.none`)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return (data || []) as Transaction[];
    },
    enabled: !!family?.id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user, family } = useAuth();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user?.id || !family?.id) {
        throw new Error('User or family not found');
      }

      const transactionData = {
        family_id: family.id,
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        type: data.type,
        expense_group: data.type === 'expense' ? data.expense_group : null,
        category_id: data.category_id || null,
        due_date: format(data.due_date, 'yyyy-MM-dd'),
        recurrence_type: data.recurrence_type,
        recurrence_interval: data.recurrence_type === 'custom' ? data.recurrence_interval : null,
        recurrence_start_date: data.recurrence_type !== 'none' ? format(data.due_date, 'yyyy-MM-dd') : null,
        recurrence_end_date: data.recurrence_end_date ? format(data.recurrence_end_date, 'yyyy-MM-dd') : null,
        recurrence_count: data.recurrence_count || null,
        notify_on_due: data.notify_on_due || false,
        notify_days_before: data.notify_days_before || null,
      };

      const { data: result, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Lançamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao criar lançamento');
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      scope = 'single',
    }: {
      id: string;
      data: Partial<TransactionFormData>;
      scope?: RecurrenceEditScope;
    }) => {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.expense_group !== undefined) updateData.expense_group = data.expense_group;
      if (data.category_id !== undefined) updateData.category_id = data.category_id;
      if (data.due_date !== undefined) updateData.due_date = format(data.due_date, 'yyyy-MM-dd');
      if (data.recurrence_type !== undefined) updateData.recurrence_type = data.recurrence_type;
      if (data.notify_on_due !== undefined) updateData.notify_on_due = data.notify_on_due;
      if (data.notify_days_before !== undefined) updateData.notify_days_before = data.notify_days_before;

      // For now, handle single update (scope logic can be expanded later)
      const { data: result, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Lançamento atualizado!');
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar lançamento');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scope = 'single' }: { id: string; scope?: RecurrenceEditScope }) => {
      // For now, handle single delete
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Lançamento excluído!');
    },
    onError: (error) => {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir lançamento');
    },
  });
}

export function useTogglePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          is_paid: isPaid,
          paid_date: isPaid ? format(new Date(), 'yyyy-MM-dd') : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Error toggling paid status:', error);
      toast.error('Erro ao atualizar status');
    },
  });
}
