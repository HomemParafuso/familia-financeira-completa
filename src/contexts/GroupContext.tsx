
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Group, GroupMember, Permission } from '@/types/auth';
import { mockGroups } from '@/mockData';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface GroupContextType {
  groups: Group[];
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  createGroup: (name: string, description?: string) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (id: string) => void;
  addMember: (groupId: string, userId: string, name: string, role: GroupMember['role'], permissions: Permission[]) => void;
  updateMemberPermissions: (groupId: string, userId: string, permissions: Permission[]) => void;
  removeMember: (groupId: string, userId: string) => void;
  getUserGroups: () => Group[];
  canUserPerform: (permission: Permission) => boolean;
  isLoading: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        setGroups(mockGroups);
        
        // Set current group if user belongs to any
        if (user) {
          const userGroups = mockGroups.filter(group => 
            group.members.some(member => member.userId === user.id)
          );
          
          if (userGroups.length > 0) {
            setCurrentGroup(userGroups[0]);
          }
        }
      } catch (error) {
        console.error('Error loading group data:', error);
        toast.error('Erro ao carregar dados dos grupos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

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
    if (!user || !currentGroup) return false;
    
    const member = currentGroup.members.find(m => m.userId === user.id);
    if (!member) return false;
    
    // Owners can do anything
    if (member.role === 'owner') return true;
    
    // Check specific permission
    return member.permissions.includes(permission);
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        setCurrentGroup,
        createGroup,
        updateGroup,
        deleteGroup,
        addMember,
        updateMemberPermissions,
        removeMember,
        getUserGroups,
        canUserPerform,
        isLoading
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};
