
import { Category } from '@/types/finance';
import { toast } from 'sonner';

// Constante para guardar a chave do localStorage
const STORAGE_KEY = 'finance_categories';

// Função para carregar categorias do localStorage
const loadCategories = (): Category[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading categories from localStorage', error);
    return [];
  }
};

// Função para salvar categorias no localStorage
const saveCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories to localStorage', error);
  }
};

// Add a new category
export const addCategory = (
  categories: Category[], 
  category: Omit<Category, 'id'>
): Category[] => {
  const newCategory: Category = {
    ...category,
    id: `c${Date.now()}`
  };
  
  const result = [...categories, newCategory];
  saveCategories(result);
  toast.success('Categoria adicionada com sucesso!');
  return result;
};

// Update an existing category
export const updateCategory = (
  categories: Category[], 
  updatedCategory: Category
): Category[] => {
  const result = categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
  saveCategories(result);
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
  saveCategories(result);
  toast.success('Categoria excluída com sucesso!');
  return { success: true, categories: result };
};

// Inicializar categorias a partir do localStorage
export const initializeCategories = (): Category[] => {
  const storedCategories = loadCategories();
  
  // Se não houver categorias armazenadas, retornar um conjunto inicial vazio
  // As categorias serão carregadas da mockData inicialmente
  return storedCategories;
};
