
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'member';

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: GroupMember[];
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  role: GroupRole;
  permissions: Permission[];
}

export type GroupRole = 'owner' | 'admin' | 'member';

export type Permission = 
  | 'view_transactions' 
  | 'add_expenses' 
  | 'add_income' 
  | 'edit_transactions' 
  | 'delete_transactions'
  | 'manage_categories'
  | 'manage_budgets'
  | 'manage_members'
  | 'view_reports';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
