
import { Category, Transaction, User, Group, Budget } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'admin',
    createdAt: '2023-01-15T10:30:00Z',
    avatar: 'https://i.pravatar.cc/150?u=joao'
  },
  {
    id: 'u2',
    name: 'Maria Costa',
    email: 'maria@example.com',
    role: 'member',
    createdAt: '2023-01-20T14:45:00Z',
    avatar: 'https://i.pravatar.cc/150?u=maria'
  },
  {
    id: 'u3',
    name: 'Pedro Alves',
    email: 'pedro@example.com',
    role: 'member',
    createdAt: '2023-02-05T09:15:00Z',
    avatar: 'https://i.pravatar.cc/150?u=pedro'
  },
];

// Mock Categories
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

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'expense',
    amount: 150.75,
    description: 'Compras no supermercado',
    categoryId: 'c1',
    date: '2023-04-01T15:30:00Z',
    createdBy: 'u1',
    tags: ['mensal', 'essencial'],
    createdAt: '2023-04-01T15:30:00Z',
    updatedAt: '2023-04-01T15:30:00Z'
  },
  {
    id: 't2',
    type: 'expense',
    amount: 1200,
    description: 'Aluguel',
    categoryId: 'c2',
    date: '2023-04-05T10:00:00Z',
    createdBy: 'u1',
    recurring: {
      frequency: 'monthly'
    },
    tags: ['mensal', 'moradia'],
    createdAt: '2023-04-05T10:00:00Z',
    updatedAt: '2023-04-05T10:00:00Z'
  },
  {
    id: 't3',
    type: 'expense',
    amount: 100,
    description: 'Gasolina',
    categoryId: 'c3',
    date: '2023-04-08T18:45:00Z',
    createdBy: 'u2',
    tags: ['transporte'],
    createdAt: '2023-04-08T18:45:00Z',
    updatedAt: '2023-04-08T18:45:00Z'
  },
  {
    id: 't4',
    type: 'expense',
    amount: 350,
    description: 'Curso online',
    categoryId: 'c4',
    date: '2023-04-10T14:20:00Z',
    createdBy: 'u3',
    tags: ['educação'],
    createdAt: '2023-04-10T14:20:00Z',
    updatedAt: '2023-04-10T14:20:00Z'
  },
  {
    id: 't5',
    type: 'income',
    amount: 3500,
    description: 'Salário mensal',
    categoryId: 'c7',
    date: '2023-04-05T09:00:00Z',
    createdBy: 'u1',
    recurring: {
      frequency: 'monthly'
    },
    tags: ['mensal', 'salário'],
    createdAt: '2023-04-05T09:00:00Z',
    updatedAt: '2023-04-05T09:00:00Z'
  },
  {
    id: 't6',
    type: 'income',
    amount: 120,
    description: 'Dividendos',
    categoryId: 'c8',
    date: '2023-04-15T11:30:00Z',
    createdBy: 'u1',
    tags: ['investimentos'],
    createdAt: '2023-04-15T11:30:00Z',
    updatedAt: '2023-04-15T11:30:00Z'
  }
];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Família Silva',
    description: 'Gerenciamento financeiro da família',
    ownerId: 'u1',
    members: [
      {
        userId: 'u1',
        name: 'João Silva',
        role: 'owner',
        permissions: [
          'view_transactions',
          'add_expenses',
          'add_income',
          'edit_transactions',
          'delete_transactions',
          'manage_categories',
          'manage_members',
          'view_reports'
        ]
      },
      {
        userId: 'u2',
        name: 'Maria Costa',
        role: 'admin',
        permissions: [
          'view_transactions',
          'add_expenses',
          'add_income',
          'edit_transactions',
          'manage_categories',
          'view_reports'
        ]
      },
      {
        userId: 'u3',
        name: 'Pedro Alves',
        role: 'member',
        permissions: [
          'view_transactions',
          'add_expenses',
          'view_reports'
        ]
      }
    ],
    createdAt: '2023-01-15T10:30:00Z'
  }
];

// Mock Budgets
export const mockBudgets: Budget[] = [
  {
    id: 'b1',
    categoryId: 'c1',
    amount: 600,
    spent: 450.75,
    period: 'monthly',
    startDate: '2023-04-01T00:00:00Z'
  },
  {
    id: 'b2',
    categoryId: 'c2',
    amount: 1300,
    spent: 1200,
    period: 'monthly',
    startDate: '2023-04-01T00:00:00Z'
  },
  {
    id: 'b3',
    categoryId: 'c3',
    amount: 300,
    spent: 100,
    period: 'monthly',
    startDate: '2023-04-01T00:00:00Z'
  },
  {
    id: 'b4',
    categoryId: 'c4',
    amount: 400,
    spent: 350,
    period: 'monthly',
    startDate: '2023-04-01T00:00:00Z'
  }
];
