
import { Category } from '@/types/finance';
import { toast } from 'sonner';

// Add a new category
export const addCategory = (
  categories: Category[], 
  category: Omit<Category, 'id'>
): Category[] => {
  const newCategory: Category = {
    ...category,
    id: `c${Date.now()}`
  };
  
  toast.success('Categoria adicionada com sucesso!');
  return [...categories, newCategory];
};

// Update an existing category
export const updateCategory = (
  categories: Category[], 
  updatedCategory: Category
): Category[] => {
  const result = categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
  toast.success('Categoria atualizada com sucesso!');
  return result;
};

// Delete a category if it's not being used
export const deleteCategory = (
  categories: Category[], 
  transactions: any[], 
  categoryId: string
): { success: boolean; categories: Category[] } => {
  // Check if category is in use
  if (transactions.some(t => t.categoryId === categoryId)) {
    toast.error('Esta categoria está em uso e não pode ser excluída');
    return { success: false, categories };
  }
  
  const result = categories.filter(c => c.id !== categoryId);
  toast.success('Categoria excluída com sucesso!');
  return { success: true, categories: result };
};
