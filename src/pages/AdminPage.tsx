
import React from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/mockData';
import { Shield, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    toast.error("Você não tem permissão para acessar esta página");
    return <Navigate to="/dashboard" />;
  }

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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados na plataforma
            </CardDescription>
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
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(mockUser => (
                    <tr key={mockUser.id} className="border-b">
                      <td className="py-2 px-4">{mockUser.name}</td>
                      <td className="py-2 px-4">{mockUser.email}</td>
                      <td className="py-2 px-4">{
                        new Date(mockUser.createdAt).toLocaleDateString('pt-BR')
                      }</td>
                      <td className="py-2 px-4 text-center">
                        {mockUser.email === "pabllo.tca@gmail.com" ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
