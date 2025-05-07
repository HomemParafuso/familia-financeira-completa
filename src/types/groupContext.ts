
import { Group, GroupMember, Permission } from '@/types/auth';

export interface GroupContextType {
  groups: Group[];
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  createGroup: (name: string, description?: string) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (id: string) => void;
  addMember: (groupId: string, userId: string, name: string, role: GroupMember['role'], permissions: Permission[]) => void;
  updateMemberPermissions: (groupId: string, userId: string, permissions: Permission[]) => void;
  updateMemberRole: (groupId: string, userId: string, role: GroupMember['role']) => void;
  removeMember: (groupId: string, userId: string) => void;
  getUserGroups: () => Group[];
  canUserPerform: (permission: Permission) => boolean;
  isLoading: boolean;
  setUserExpiration: (userId: string, expirationDate: string) => void;
  getGroupAdmin: (groupId: string) => GroupMember | undefined;
  getUserReport: (userId: string) => any; // Para obter relatório específico de um usuário
  exportReport: (format: 'pdf' | 'excel' | 'ofx') => void;
  sendPasswordResetEmail: (email: string) => boolean; // Nova função para recuperação de senha
}
