
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/mockData';
import { Shield, Check, X, UserPlus, User, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotifications } from '@/contexts/NotificationContext';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    toast.error("Você não tem permissão para acessar esta página");
    return <Navigate to="/dashboard" />;
  }

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(
    u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle add user (mock implementation)
  const handleAddUser = () => {
    if (!newUserName || !newUserEmail) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    toast.success(`Usuário ${newUserName} adicionado com sucesso`);
    addNotification('success', 'Novo usuário', `${newUserName} foi adicionado com sucesso`);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setIsAdmin(false);
  };

  // Handle toggle admin status (mock implementation)
  const handleToggleAdmin = (userName: string, isCurrentlyAdmin: boolean) => {
    const newStatus = !isCurrentlyAdmin;
    const action = newStatus ? "promovido a administrador" : "removido da função de administrador";
    toast.success(`Usuário ${userName} foi ${action}`);
    addNotification(
      'info', 
      'Alteração de permissão', 
      `${userName} foi ${action}`
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-500" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie usuários e configure o sistema
            </p>
          </div>
          <Button 
            onClick={() => setIsAddUserOpen(true)}
            className="bg-finance-primary hover:bg-finance-primary/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados na plataforma
            </CardDescription>
            <div className="flex items-center mt-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Buscar usuários..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-2 px-4 text-left">Nome</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Data de Cadastro</th>
                    <th className="py-2 px-4 text-center">Admin</th>
                    <th className="py-2 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(mockUser => {
                    const isUserAdmin = mockUser.email === "pabllo.tca@gmail.com";
                    return (
                      <tr key={mockUser.id} className="border-b hover:bg-muted/20">
                        <td className="py-2 px-4">{mockUser.name}</td>
                        <td className="py-2 px-4">{mockUser.email}</td>
                        <td className="py-2 px-4">{
                          new Date(mockUser.createdAt).toLocaleDateString('pt-BR')
                        }</td>
                        <td className="py-2 px-4 text-center">
                          {isUserAdmin ? (
                            <Check className="mx-auto h-4 w-4 text-green-500" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-red-500" />
                          )}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Button
                            size="sm"
                            variant={isUserAdmin ? "destructive" : "outline"}
                            className="text-xs h-7"
                            onClick={() => handleToggleAdmin(mockUser.name, isUserAdmin)}
                          >
                            {isUserAdmin ? "Remover Admin" : "Tornar Admin"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo usuário ao sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Admin
              </label>
              <div className="flex items-center col-span-3">
                <input 
                  type="checkbox" 
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isAdmin" className="text-sm">Usuário é administrador</label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="mr-2">
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>
              Adicionar Usuário
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPage;
