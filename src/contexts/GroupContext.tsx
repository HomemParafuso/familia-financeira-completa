
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Group } from '@/types/auth';
import { GroupContextType } from '@/types/groupContext';
import { useAuth } from './AuthContext';
import { useGroupActions } from '@/hooks/useGroupActions';
import { toast } from 'sonner';

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
    exportReport,
    sendPasswordResetEmail
  } = useGroupActions([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(false);
        
        // Set current group if user belongs to any
        if (user && groups.length > 0) {
          const userGroups = groups.filter(group => 
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
  }, [user, setCurrentGroup]);

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
        exportReport,
        sendPasswordResetEmail
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
