import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Users, CreditCard, TrendingUp, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/Dashboard';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
  createdAt: string;
  status: 'active' | 'inactive';
  lastAccess?: string;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const availablePermissions: { value: Permission; label: string; description: string }[] = [
    { value: 'view_transactions', label: 'Ver Transações', description: 'Visualizar todas as transações financeiras' },
    { value: 'add_expenses', label: 'Adicionar Despesas', description: 'Registrar novas despesas' },
    { value: 'add_income', label: 'Adicionar Receitas', description: 'Registrar novas receitas' },
    { value: 'edit_transactions', label: 'Editar Transações', description: 'Modificar transações existentes' },
    { value: 'delete_transactions', label: 'Excluir Transações', description: 'Remover transações' },
    { value: 'manage_categories', label: 'Gerenciar Categorias', description: 'Criar e editar categorias' },
    { value: 'manage_budgets', label: 'Gerenciar Orçamentos', description: 'Criar e modificar orçamentos' },
    { value: 'view_reports', label: 'Ver Relatórios', description: 'Acessar relatórios financeiros' },
  ];

  const handleCreateMember = () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      toast.error('Preencha nome e email');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Selecione pelo menos uma permissão');
      return;
    }

    const newMember: FamilyMember = {
      id: `member_${Date.now()}`,
      name: memberName.trim(),
      email: memberEmail.trim(),
      permissions: selectedPermissions,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setFamilyMembers(prev => [...prev, newMember]);
    
    // Reset form
    setMemberName('');
    setMemberEmail('');
    setSelectedPermissions([]);
    setIsCreateOpen(false);
    
    toast.success(`Membro ${memberName} cadastrado com sucesso! Um email foi enviado com as credenciais.`);
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleToggleStatus = (memberId: string) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
          : member
      )
    );
    toast.success('Status do membro atualizado');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Painel do Gestor</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua família e suas permissões financeiras
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membros da Família</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{familyMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                {familyMembers.filter(m => m.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">
                Sem dados ainda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">
                Sem transações ainda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">
                Meta mensal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Membros da Família</h2>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-finance-primary hover:bg-finance-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>

        {/* Members Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum membro cadastrado ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  familyMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.slice(0, 2).map(permission => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {availablePermissions.find(p => p.value === permission)?.label}
                            </Badge>
                          ))}
                          {member.permissions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(member.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className={member.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {member.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(member.id)}
                        >
                          {member.status === 'active' ? 'Desativar' : 'Ativar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Member Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Membro da Família</DialogTitle>
            <DialogDescription>
              Cadastre um novo membro e defina suas permissões financeiras
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Nome *</Label>
                <Input
                  id="member-name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="member-email">Email *</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="maria@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Permissões Financeiras *</Label>
              <div className="grid grid-cols-1 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={permission.value}
                      checked={selectedPermissions.includes(permission.value)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.value, checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label 
                        htmlFor={permission.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Importante:</strong> Um email será enviado automaticamente para o membro com:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Link de acesso ao sistema</li>
                    <li>Credenciais temporárias</li>
                    <li>Resumo das permissões concedidas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateMember}
              disabled={!memberName.trim() || !memberEmail.trim() || selectedPermissions.length === 0}
              className="bg-finance-primary hover:bg-finance-primary/90"
            >
              Adicionar Membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManagerDashboard;