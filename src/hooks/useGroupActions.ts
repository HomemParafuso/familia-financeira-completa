
import { useState } from 'react';
import { Group, GroupMember, Permission } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useGroupActions = (initialGroups: Group[] = []) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // CRUD operations
  const createGroup = (name: string, description?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um grupo');
      return;
    }
    
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name,
      description,
      ownerId: user.id,
      members: [
        {
          userId: user.id,
          name: user.name,
          role: 'owner',
          permissions: [
            'view_transactions',
            'add_expenses',
            'add_income',
            'edit_transactions',
            'delete_transactions',
            'manage_categories',
            'manage_budgets',
            'manage_members',
            'view_reports'
          ]
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    setGroups([...groups, newGroup]);
    setCurrentGroup(newGroup);
    toast.success('Grupo criado com sucesso!');
  };

  const updateGroup = (updatedGroup: Group) => {
    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    
    if (currentGroup?.id === updatedGroup.id) {
      setCurrentGroup(updatedGroup);
    }
    
    toast.success('Grupo atualizado com sucesso!');
  };

  const deleteGroup = (id: string) => {
    // Only group owner can delete
    const group = groups.find(g => g.id === id);
    if (!group || group.ownerId !== user?.id) {
      toast.error('Você não tem permissão para excluir este grupo');
      return;
    }
    
    setGroups(groups.filter(g => g.id !== id));
    
    if (currentGroup?.id === id) {
      setCurrentGroup(null);
    }
    
    toast.success('Grupo excluído com sucesso!');
  };

  // Member management
  const addMember = (
    groupId: string, 
    userId: string, 
    name: string,
    role: GroupMember['role'], 
    permissions: Permission[]
  ) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    // Check if member already exists
    if (group.members.some(m => m.userId === userId)) {
      toast.error('Este usuário já é membro do grupo');
      return;
    }
    
    const updatedGroup = {
      ...group,
      members: [
        ...group.members,
        { userId, name, role, permissions }
      ]
    };
    
    updateGroup(updatedGroup);
    toast.success('Membro adicionado com sucesso!');
  };

  const updateMemberPermissions = (
    groupId: string, 
    userId: string, 
    permissions: Permission[]
  ) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const updatedMembers = group.members.map(member => 
      member.userId === userId 
        ? { ...member, permissions } 
        : member
    );
    
    const updatedGroup = {
      ...group,
      members: updatedMembers
    };
    
    updateGroup(updatedGroup);
    toast.success('Permissões atualizadas com sucesso!');
  };

  const removeMember = (groupId: string, userId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    // Cannot remove owner
    if (group.ownerId === userId) {
      toast.error('Não é possível remover o proprietário do grupo');
      return;
    }
    
    const updatedGroup = {
      ...group,
      members: group.members.filter(m => m.userId !== userId)
    };
    
    updateGroup(updatedGroup);
    toast.success('Membro removido com sucesso!');
  };

  // Helper functions
  const getUserGroups = () => {
    if (!user) return [];
    return groups.filter(group => 
      group.members.some(member => member.userId === user.id)
    );
  };

  const canUserPerform = (permission: Permission) => {
    if (!user) {
      console.log("No user logged in, denying permission");
      return false;
    }
    
    // System admin check
    if (user.role === 'admin') {
      console.log(`User ${user.email} is system admin with role ${user.role}, granting all permissions`);
      return true;
    }
    
    // If no group selected, check if it's a personal permission
    if (!currentGroup) {
      // For personal transactions (no group), allow basic operations
      if (permission === 'add_expenses' || 
          permission === 'add_income' || 
          permission === 'view_transactions' ||
          permission === 'edit_transactions' ||
          permission === 'delete_transactions') {
        console.log(`No current group, granting basic transaction permission ${permission} to user ${user.email}`);
        return true;
      }
      console.log(`No current group, denying permission ${permission} to user ${user.email}`);
      return false;
    }
    
    const member = currentGroup.members.find(m => m.userId === user.id);
    if (!member) {
      console.log(`User ${user.email} not found in group members, denying permission`);
      return false;
    }
    
    // Group owner check
    if (member.role === 'owner') {
      console.log(`User ${user.email} is group owner, granting all permissions`);
      return true;
    }
    
    // Group admin check
    if (member.role === 'admin') {
      // Add any permissions that group admins should have automatically
      if (permission === 'view_transactions' ||
          permission === 'add_expenses' ||
          permission === 'add_income') {
        console.log(`User ${user.email} is group admin, granting basic permission ${permission}`);
        return true;
      }
    }
    
    // Check specific permissions
    const hasPermission = member.permissions.includes(permission);
    console.log(`User ${user.email} explicit permission check for ${permission}: ${hasPermission}`);
    return hasPermission;
  };

  return {
    groups,
    setGroups,
    currentGroup,
    setCurrentGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    updateMemberPermissions,
    removeMember,
    getUserGroups,
    canUserPerform
  };
};
