
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { mockUsers } from '@/mockData';
import { Shield, Check, X, UserPlus, Calendar, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { groups, setUserExpiration } = useGroup();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSetExpirationOpen, setIsSetExpirationOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
  );
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
  
  // Handle setting user expiration date
  const handleOpenExpirationDialog = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsSetExpirationOpen(true);
  };
  
  const handleSetExpiration = () => {
    if (selectedUserId && expirationDate) {
      setUserExpiration(selectedUserId, expirationDate.toISOString());
      addNotification(
        'info',
        'Data de expiração definida',
        `A data de expiração para ${selectedUserName} foi definida para ${format(expirationDate, 'PPP', { locale: ptBR })}`
      );
      setIsSetExpirationOpen(false);
    }
  };
  
  // Handle export reports
  const handleExportReport = (format: 'pdf' | 'excel' | 'ofx') => {
    const formatName = format === 'pdf' ? 'PDF' : format === 'excel' ? 'Excel' : 'OFX';
    toast.success(`Relatório exportado em formato ${formatName}`);
    addNotification(
      'success',
      `Exportação em ${formatName}`,
      `Seu relatório foi exportado com sucesso no formato ${formatName}`
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
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExportReport('pdf')}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button 
              onClick={() => handleExportReport('excel')}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button 
              onClick={() => setIsAddUserOpen(true)}
              className="bg-finance-primary hover:bg-finance-primary/90"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          </div>
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
                    <th className="py-2 px-4 text-center">Expiração</th>
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
                          {mockUser.expirationDate ? (
                            new Date(mockUser.expirationDate).toLocaleDateString('pt-BR')
                          ) : (
                            "Não definida"
                          )}
                        </td>
                        <td className="py-2 px-4 flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant={isUserAdmin ? "destructive" : "outline"}
                            className="text-xs h-7"
                            onClick={() => handleToggleAdmin(mockUser.name, isUserAdmin)}
                          >
                            {isUserAdmin ? "Remover Admin" : "Tornar Admin"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => handleOpenExpirationDialog(mockUser.id, mockUser.name)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Expiração
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
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Grupos</CardTitle>
            <CardDescription>
              Visão geral dos grupos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total de Grupos</div>
                <div className="text-3xl font-bold">{groups.length}</div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Usuários em Grupos</div>
                <div className="text-3xl font-bold">
                  {new Set(groups.flatMap(g => g.members).map(m => m.userId)).size}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Média de Membros por Grupo</div>
                <div className="text-3xl font-bold">
                  {groups.length ? Math.round(groups.reduce((acc, g) => acc + g.members.length, 0) / groups.length * 10) / 10 : 0}
                </div>
              </div>
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="expiration" className="text-right text-sm font-medium">
                Expiração
              </label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="expiration"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expirationDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {expirationDate ? (
                        format(expirationDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={expirationDate}
                      onSelect={setExpirationDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
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
      
      {/* Set Expiration Dialog */}
      <Dialog open={isSetExpirationOpen} onOpenChange={setIsSetExpirationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Definir Data de Expiração</DialogTitle>
            <DialogDescription>
              Defina a data de expiração para o acesso do usuário {selectedUserName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-2">
              <Label htmlFor="expiration-date">Data de Expiração</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expiration-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {expirationDate ? (
                      format(expirationDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSetExpirationOpen(false)} className="mr-2">
              Cancelar
            </Button>
            <Button onClick={handleSetExpiration}>
              Definir Expiração
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPage;
