import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { UserPlus, Users, Settings, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Manager {
  id: string;
  name: string;
  email: string;
  familyGroupName: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [familyGroupName, setFamilyGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCreateManager = () => {
    if (!managerName.trim() || !managerEmail.trim() || !familyGroupName.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Simular criação do gestor e grupo
    const newManager: Manager = {
      id: `manager_${Date.now()}`,
      name: managerName.trim(),
      email: managerEmail.trim(),
      familyGroupName: familyGroupName.trim(),
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setManagers(prev => [...prev, newManager]);
    
    // Resetar form
    setManagerName('');
    setManagerEmail('');
    setFamilyGroupName('');
    setGroupDescription('');
    setIsCreateOpen(false);
    
    toast.success(`Gestor ${managerName} cadastrado com sucesso! Um email foi enviado com as credenciais.`);
  };

  const handleToggleStatus = (managerId: string) => {
    setManagers(prev => 
      prev.map(manager => 
        manager.id === managerId 
          ? { ...manager, status: manager.status === 'active' ? 'inactive' : 'active' }
          : manager
      )
    );
    toast.success('Status do gestor atualizado');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Administrador
            </Badge>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Gestores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.length}</div>
              <p className="text-xs text-muted-foreground">
                {managers.filter(m => m.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grupos Familiares</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.length}</div>
              <p className="text-xs text-muted-foreground">
                Um grupo por gestor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos este mês</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managers.filter(m => {
                  const createdDate = new Date(m.createdAt);
                  const now = new Date();
                  return createdDate.getMonth() === now.getMonth() && 
                         createdDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Gestores cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestores Cadastrados</h2>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-finance-primary hover:bg-finance-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Cadastrar Gestor
          </Button>
        </div>

        {/* Managers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grupo Familiar</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum gestor cadastrado ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  managers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">{manager.name}</TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>{manager.familyGroupName}</TableCell>
                      <TableCell>{new Date(manager.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={manager.status === 'active' ? 'default' : 'secondary'}
                          className={manager.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {manager.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(manager.id)}
                        >
                          {manager.status === 'active' ? 'Desativar' : 'Ativar'}
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

      {/* Create Manager Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Gestor</DialogTitle>
            <DialogDescription>
              Cadastre um novo gestor de família. Um grupo será criado automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manager-name">Nome do Gestor *</Label>
              <Input
                id="manager-name"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager-email">Email do Gestor *</Label>
              <Input
                id="manager-email"
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="joao@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="family-group-name">Nome do Grupo Familiar *</Label>
              <Input
                id="family-group-name"
                value={familyGroupName}
                onChange={(e) => setFamilyGroupName(e.target.value)}
                placeholder="Ex: Família Silva"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group-description">Descrição do Grupo (opcional)</Label>
              <Textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Breve descrição do grupo familiar"
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Importante:</strong> Um email será enviado automaticamente para o gestor com:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Link de acesso ao sistema</li>
                    <li>Credenciais temporárias</li>
                    <li>Instruções de primeiro acesso</li>
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
              onClick={handleCreateManager}
              disabled={!managerName.trim() || !managerEmail.trim() || !familyGroupName.trim()}
              className="bg-finance-primary hover:bg-finance-primary/90"
            >
              Cadastrar Gestor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;