
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Group, GroupMember, Permission, GroupRole } from '@/types/auth';
import { Crown, MoreVertical, Plus, Trash, UserCog } from 'lucide-react';

interface MemberManagementProps {
  group: Group;
  onAddMember: (email: string, name: string, role: GroupRole, permissions: Permission[]) => void;
  onUpdatePermissions: (userId: string, permissions: Permission[]) => void;
  onRemoveMember: (userId: string) => void;
}

const allPermissions: { value: Permission; label: string }[] = [
  { value: 'view_transactions', label: 'Ver transações' },
  { value: 'add_expenses', label: 'Adicionar despesas' },
  { value: 'add_income', label: 'Adicionar receitas' },
  { value: 'edit_transactions', label: 'Editar transações' },
  { value: 'delete_transactions', label: 'Excluir transações' },
  { value: 'manage_categories', label: 'Gerenciar categorias' },
  { value: 'manage_members', label: 'Gerenciar membros' },
  { value: 'view_reports', label: 'Ver relatórios' },
];

const MemberManagement: React.FC<MemberManagementProps> = ({
  group,
  onAddMember,
  onUpdatePermissions,
  onRemoveMember,
}) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<GroupRole>('member');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const handleAddMember = () => {
    onAddMember(newMemberEmail, newMemberName, newMemberRole, selectedPermissions);
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberRole('member');
    setSelectedPermissions([]);
    setIsAddMemberOpen(false);
  };

  const handleUpdatePermissions = () => {
    if (selectedMember) {
      onUpdatePermissions(selectedMember.userId, selectedPermissions);
      setIsPermissionsOpen(false);
    }
  };

  const openPermissionsDialog = (member: GroupMember) => {
    setSelectedMember(member);
    setSelectedPermissions(member.permissions);
    setIsPermissionsOpen(true);
  };

  const isPermissionSelected = (permission: Permission) => {
    return selectedPermissions.includes(permission);
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Membros do Grupo</h3>
        <Button 
          onClick={() => setIsAddMemberOpen(true)}
          className="bg-finance-primary hover:bg-finance-primary/90"
        >
          <Plus className="mr-1 h-4 w-4" /> Adicionar Membro
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.members.map((member) => (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center">
                    {member.role === 'owner' && (
                      <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                    )}
                    <span>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {member.role === 'owner' ? 'Proprietário' : 
                   member.role === 'admin' ? 'Administrador' : 'Membro'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => openPermissionsDialog(member)}
                        disabled={member.role === 'owner'}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Permissões
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => onRemoveMember(member.userId)}
                        disabled={member.role === 'owner'}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Membro</DialogTitle>
            <DialogDescription>
              Adicione um novo membro ao grupo e defina suas permissões.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="role">Função</Label>
              <Select value={newMemberRole} onValueChange={(v: GroupRole) => setNewMemberRole(v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permissões</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allPermissions.map((permission) => (
                  <div key={permission.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.value}`}
                      checked={isPermissionSelected(permission.value)}
                      onCheckedChange={() => togglePermission(permission.value)}
                    />
                    <label
                      htmlFor={`permission-${permission.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleAddMember} className="bg-finance-primary hover:bg-finance-primary/90">
              Adicionar Membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Permissões</DialogTitle>
            <DialogDescription>
              Configure as permissões de {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allPermissions.map((permission) => (
                <div key={permission.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-permission-${permission.value}`}
                    checked={isPermissionSelected(permission.value)}
                    onCheckedChange={() => togglePermission(permission.value)}
                  />
                  <label
                    htmlFor={`edit-permission-${permission.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUpdatePermissions} className="bg-finance-primary hover:bg-finance-primary/90">
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberManagement;
