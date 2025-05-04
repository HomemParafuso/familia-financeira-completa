
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Group } from '@/types/auth';
import { GroupContextType } from '@/types/groupContext';
import { mockGroups } from '@/mockData';
import { useAuth } from './AuthContext';
import { useGroupActions } from '@/hooks/useGroupActions';
import { toast } from 'sonner';
import { ReportFormat } from '@/types/finance';

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    groups,
    setGroups,
    currentGroup,
    setCurrentGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    updateMemberPermissions,
    updateMemberRole,
    removeMember,
    getUserGroups,
    canUserPerform,
    setUserExpiration,
    getGroupAdmin,
    getUserReport,
    exportReport
  } = useGroupActions([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Garantir que cada grupo tenha exatamente um administrador
        const updatedGroups = mockGroups.map(group => {
          // Encontrar o primeiro administrador
          const adminIndex = group.members.findIndex(m => m.role === 'admin');
          if (adminIndex !== -1) {
            // Atualizar todos os outros admin para member
            return {
              ...group,
              members: group.members.map((m, idx) => 
                idx !== adminIndex && m.role === 'admin'
                  ? { ...m, role: 'member' as const }
                  : m
              )
            };
          }
          return group;
        });
        
        setGroups(updatedGroups);
        
        // Set current group if user belongs to any
        if (user) {
          const userGroups = updatedGroups.filter(group => 
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
  }, [user, setGroups, setCurrentGroup]);

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
        updateMemberRole,
        removeMember,
        getUserGroups,
        canUserPerform,
        isLoading,
        setUserExpiration,
        getGroupAdmin,
        getUserReport,
        exportReport
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
