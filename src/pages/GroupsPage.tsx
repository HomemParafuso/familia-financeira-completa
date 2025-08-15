
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/Dashboard';
import GroupList from '@/components/groups/GroupList';
import MemberManagement from '@/components/groups/MemberManagement';
import { Group } from '@/types/auth';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';

const GroupsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    groups, 
    currentGroup, 
    setCurrentGroup, 
    createGroup, 
    updateGroup, 
    deleteGroup, 
    addMember, 
    updateMemberPermissions,
    updateMemberRole,
    removeMember 
  } = useGroup();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [tabValue, setTabValue] = useState('members');
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Check if current user is a group admin of the selected group
  const isCurrentUserGroupAdmin = selectedGroup && 
    (user?.role === 'admin' || 
     selectedGroup.members.some(m => m.userId === user?.id && m.role === 'manager'));

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGroup(groupName.trim(), groupDescription.trim() || undefined);
      setGroupName('');
      setGroupDescription('');
      setIsCreateOpen(false);
    }
  };

  const handleSelectGroup = (group: Group) => {
    setCurrentGroup(group);
  };

  const handleManageGroup = (group: Group) => {
    setSelectedGroup(group);
    setTabValue('members');
    setIsManageOpen(true);
  };

  const handleDeleteGroup = () => {
    if (selectedGroup && window.confirm(`Tem certeza que deseja excluir o grupo "${selectedGroup.name}"?`)) {
      deleteGroup(selectedGroup.id);
      setIsManageOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Grupos</h1>
          <p className="text-muted-foreground">
            Gerencie seus grupos e controle o acesso de membros
          </p>
        </div>

        <GroupList 
          groups={groups} 
          currentGroupId={currentGroup?.id}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={() => setIsCreateOpen(true)}
          onManageGroup={handleManageGroup}
        />
      </div>
      
      {/* Create Group Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
            <DialogDescription>
              Crie um novo grupo para compartilhar suas finanças
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo</Label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Família Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Breve descrição do grupo"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
              className="bg-finance-primary hover:bg-finance-primary/90"
            >
              Criar Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Group Dialog */}
      <Dialog open={isManageOpen && !!selectedGroup} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedGroup && (
            <>
              <DialogHeader>
                <DialogTitle>Gerenciar Grupo: {selectedGroup.name}</DialogTitle>
                <DialogDescription>
                  {selectedGroup.description || 'Gerencie os detalhes e membros do grupo'}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={tabValue} onValueChange={setTabValue}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="members">Membros</TabsTrigger>
                  <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="members" className="space-y-4 py-4">
                  <MemberManagement
                    group={selectedGroup}
                    onAddMember={(email, name, role, permissions) => 
                      addMember(selectedGroup.id, `u${Date.now()}`, name, role, permissions)}
                    onUpdatePermissions={(userId, permissions) => 
                      updateMemberPermissions(selectedGroup.id, userId, permissions)}
                    onUpdateRole={(userId, role) =>
                      updateMemberRole(selectedGroup.id, userId, role)}
                    onRemoveMember={(userId) => removeMember(selectedGroup.id, userId)}
                  />
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Nome do Grupo</Label>
                    <Input
                      id="group-name"
                      defaultValue={selectedGroup.name}
                      onChange={(e) => {
                        const updatedGroup = { ...selectedGroup, name: e.target.value };
                        setSelectedGroup(updatedGroup);
                      }}
                      disabled={!isCurrentUserGroupAdmin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Descrição</Label>
                    <Textarea
                      id="group-description"
                      defaultValue={selectedGroup.description || ''}
                      onChange={(e) => {
                        const updatedGroup = { ...selectedGroup, description: e.target.value };
                        setSelectedGroup(updatedGroup);
                      }}
                      rows={3}
                      disabled={!isCurrentUserGroupAdmin}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    {isCurrentUserGroupAdmin && (
                      <Button
                        variant="destructive"
                        onClick={handleDeleteGroup}
                      >
                        Excluir Grupo
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => {
                        updateGroup(selectedGroup);
                        setIsManageOpen(false);
                      }}
                      className="bg-finance-primary hover:bg-finance-primary/90"
                      disabled={!isCurrentUserGroupAdmin}
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GroupsPage;
