// Database types for the Family Financial System

export type AppRole = 'admin' | 'family_manager' | 'family_member';

export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export type ExpenseGroup = 'basic' | 'financing' | 'eventual';

export type TransactionType = 'revenue' | 'expense';

export type RecurrenceType = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';

export interface Family {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  family_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface FamilyMemberPermissions {
  id: string;
  user_id: string;
  family_id: string;
  can_view_all_transactions: boolean;
  can_create_transactions: boolean;
  can_edit_own_transactions: boolean;
  can_delete_own_transactions: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyInvite {
  id: string;
  family_id: string;
  email: string;
  invited_by: string;
  status: InviteStatus;
  role: AppRole;
  created_at: string;
  expires_at: string;
}

export interface Category {
  id: string;
  family_id: string;
  name: string;
  type: TransactionType;
  expense_group: ExpenseGroup | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  family_id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  expense_group: ExpenseGroup | null;
  name: string;
  description: string | null;
  amount: number;
  due_date: string;
  paid_date: string | null;
  is_paid: boolean;
  recurrence_type: RecurrenceType;
  recurrence_interval: number | null;
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  recurrence_count: number | null;
  parent_transaction_id: string | null;
  recurrence_index: number | null;
  notify_on_due: boolean;
  notify_days_before: number | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface ProfileWithRole extends Profile {
  role?: AppRole;
}

export interface TransactionWithCategory extends Transaction {
  category?: Category;
}

// Projection types
export interface MonthlyProjection {
  month: number;
  year: number;
  monthName: string;
  revenues: number;
  expenses: number;
  basicExpenses: number;
  financingExpenses: number;
  eventualExpenses: number;
  balance: number;
  accumulatedBalance: number;
}

export interface AnnualProjection {
  year: number;
  totalRevenues: number;
  totalExpenses: number;
  totalBasicExpenses: number;
  totalFinancingExpenses: number;
  totalEventualExpenses: number;
  annualBalance: number;
  monthlyProjections: MonthlyProjection[];
}

// Form types
export interface TransactionFormData {
  name: string;
  description?: string;
  amount: number;
  type: TransactionType;
  expense_group?: ExpenseGroup;
  category_id?: string;
  due_date: Date;
  recurrence_type: RecurrenceType;
  recurrence_interval?: number;
  recurrence_end_date?: Date;
  recurrence_count?: number;
  notify_on_due?: boolean;
  notify_days_before?: number;
}

// Edit scope for recurrence
export type RecurrenceEditScope = 'single' | 'this_and_future' | 'all';
