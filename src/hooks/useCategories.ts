import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Category, TransactionType, ExpenseGroup } from '@/types/database';
import { toast } from 'sonner';

export function useCategories(type?: TransactionType) {
  const { family } = useAuth();

  return useQuery({
    queryKey: ['categories', family?.id, type],
    queryFn: async () => {
      if (!family?.id) return [];

      let query = supabase
        .from('categories')
        .select('*')
        .eq('family_id', family.id)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return (data || []) as Category[];
    },
    enabled: !!family?.id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { family } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      type: TransactionType;
      expense_group?: ExpenseGroup;
      icon?: string;
      color?: string;
    }) => {
      if (!family?.id) throw new Error('Family not found');

      const { data: result, error } = await supabase
        .from('categories')
        .insert({
          ...data,
          family_id: family.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada!');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída!');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    },
  });
}

// Default categories to create when family is first set up
export const defaultCategories: Array<{
  name: string;
  type: TransactionType;
  expense_group?: ExpenseGroup;
  icon: string;
  color: string;
}> = [
  // Revenue categories
  { name: 'Salário', type: 'revenue', icon: 'briefcase', color: '#22c55e' },
  { name: 'Freelance', type: 'revenue', icon: 'laptop', color: '#10b981' },
  { name: 'Investimentos', type: 'revenue', icon: 'trending-up', color: '#059669' },
  { name: 'Outros (Receita)', type: 'revenue', icon: 'plus-circle', color: '#047857' },

  // Basic expense categories
  { name: 'Alimentação', type: 'expense', expense_group: 'basic', icon: 'utensils', color: '#ef4444' },
  { name: 'Moradia', type: 'expense', expense_group: 'basic', icon: 'home', color: '#dc2626' },
  { name: 'Transporte', type: 'expense', expense_group: 'basic', icon: 'car', color: '#b91c1c' },
  { name: 'Saúde', type: 'expense', expense_group: 'basic', icon: 'heart', color: '#991b1b' },
  { name: 'Educação', type: 'expense', expense_group: 'basic', icon: 'book', color: '#7f1d1d' },

  // Financing categories
  { name: 'Financiamento Imóvel', type: 'expense', expense_group: 'financing', icon: 'building', color: '#f97316' },
  { name: 'Financiamento Veículo', type: 'expense', expense_group: 'financing', icon: 'car', color: '#ea580c' },
  { name: 'Empréstimo', type: 'expense', expense_group: 'financing', icon: 'credit-card', color: '#c2410c' },

  // Eventual categories
  { name: 'Lazer', type: 'expense', expense_group: 'eventual', icon: 'gamepad', color: '#8b5cf6' },
  { name: 'Viagens', type: 'expense', expense_group: 'eventual', icon: 'plane', color: '#7c3aed' },
  { name: 'Presentes', type: 'expense', expense_group: 'eventual', icon: 'gift', color: '#6d28d9' },
  { name: 'Imprevistos', type: 'expense', expense_group: 'eventual', icon: 'alert-circle', color: '#5b21b6' },
];
