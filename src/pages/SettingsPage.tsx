
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [secondaryEmail, setSecondaryEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const handleSavePersonalInfo = () => {
    toast.success("Informações pessoais atualizadas com sucesso");
  };

  const handleSavePreferences = () => {
    toast.success("Preferências atualizadas com sucesso");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSavePersonalInfo(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" defaultValue={user?.name || ''} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email principal
                    </Label>
                    <Input 
                      id="email" 
                      defaultValue={user?.email || ''} 
                      type="email" 
                      disabled 
                      className="bg-gray-100 text-gray-500"
                    />
                    <p className="text-xs text-muted-foreground">Email usado para acesso ao sistema (não pode ser alterado)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email secundário
                    </Label>
                    <Input 
                      id="secondary-email" 
                      value={secondaryEmail}
                      onChange={(e) => setSecondaryEmail(e.target.value)}
                      type="email" 
                      placeholder="Digite seu email secundário"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Telefone principal
                    </Label>
                    <Input 
                      id="phone" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      type="tel" 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="bg-finance-primary hover:bg-finance-primary/90">
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>

          {currentGroup && (
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Grupo</CardTitle>
                <CardDescription>Configurações para o grupo atual: {currentGroup.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda principal</Label>
                    <select 
                      id="currency"
                      className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue="BRL"
                    >
                      <option value="BRL">Real Brasileiro (R$)</option>
                      <option value="USD">Dólar Americano ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="default-view">Visão padrão do dashboard</Label>
                      <select 
                        id="default-view"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="month"
                      >
                        <option value="day">Diária</option>
                        <option value="week">Semanal</option>
                        <option value="month">Mensal</option>
                        <option value="year">Anual</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button className="bg-finance-primary hover:bg-finance-primary/90">
                    Salvar preferências
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">Receba atualizações sobre suas finanças por email</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de orçamento</Label>
                    <p className="text-sm text-muted-foreground">Seja notificado quando se aproximar de um limite de orçamento</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de segurança</Label>
                    <p className="text-sm text-muted-foreground">Receba notificações sobre atividades suspeitas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatórios semanais</Label>
                    <p className="text-sm text-muted-foreground">Receba um resumo semanal de suas finanças</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alterar senha</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <Button className="bg-finance-primary hover:bg-finance-primary/90">
                  Atualizar senha
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Sessões ativas</h3>
                <p className="text-sm text-muted-foreground mb-4">Você está conectado nos seguintes dispositivos:</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Este dispositivo</div>
                      <div className="text-sm text-muted-foreground">Última atividade: Agora</div>
                    </div>
                    <Button variant="outline" size="sm">Desconectar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
