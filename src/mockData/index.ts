
import { Category, Transaction, User, Group, Budget } from '@/types';

// Categorias padrão vazias
export const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Alimentação',
    type: 'expense',
    color: '#e74c3c',
    icon: 'utensils',
    isDefault: true
  },
  {
    id: 'c2',
    name: 'Moradia',
    type: 'expense',
    color: '#3498db',
    icon: 'home',
    isDefault: true
  },
  {
    id: 'c3',
    name: 'Transporte',
    type: 'expense',
    color: '#f39c12',
    icon: 'car',
    isDefault: true
  },
  {
    id: 'c4',
    name: 'Educação',
    type: 'expense',
    color: '#9b59b6',
    icon: 'book',
    isDefault: true
  },
  {
    id: 'c5',
    name: 'Saúde',
    type: 'expense',
    color: '#2ecc71',
    icon: 'heart',
    isDefault: true
  },
  {
    id: 'c6',
    name: 'Lazer',
    type: 'expense',
    color: '#16a085',
    icon: 'film',
    isDefault: true
  },
  {
    id: 'c7',
    name: 'Salário',
    type: 'income',
    color: '#27ae60',
    icon: 'wallet',
    isDefault: true
  },
  {
    id: 'c8',
    name: 'Investimentos',
    type: 'income',
    color: '#2980b9',
    icon: 'trending-up',
    isDefault: true
  },
  {
    id: 'c9',
    name: 'Presentes',
    type: 'income',
    color: '#8e44ad',
    icon: 'gift',
    isDefault: true
  }
];

// Arrays vazios para transações, usuários, grupos e orçamentos
export const mockTransactions: Transaction[] = [];
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Usuário',
    email: 'usuario@example.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    avatar: ''
  }
];
export const mockGroups: Group[] = [];
export const mockBudgets: Budget[] = [];
