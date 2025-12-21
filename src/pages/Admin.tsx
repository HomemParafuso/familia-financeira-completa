import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Building2, Users, Crown, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFamilies, useCreateFamily, useFamilyMembers } from '@/hooks/useFamily';
import { Family } from '@/types/database';

const createFamilySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  managerEmail: z.string().email('Email inválido'),
});

type CreateFamilyForm = z.infer<typeof createFamilySchema>;

function FamilyCard({ family }: { family: Family }) {
  const { data: members = [], isLoading } = useFamilyMembers(family.id);

  const managers = members.filter((m) => m.role === 'family_manager');
  const memberCount = members.filter((m) => m.role === 'family_member').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{family.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Criada em {new Date(family.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-revenue" />
              <span className="text-muted-foreground">Gestores:</span>
              {managers.length > 0 ? (
                <span className="font-medium">
                  {managers.map((m) => m.full_name || m.email).join(', ')}
                </span>
              ) : (
                <Badge variant="outline" className="text-warning">
                  Sem gestor
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Membros:</span>
              <span className="font-medium">{memberCount}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: families = [], isLoading } = useFamilies();
  const createFamily = useCreateFamily();

  const form = useForm<CreateFamilyForm>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: '',
      managerEmail: '',
    },
  });

  const onSubmit = async (data: CreateFamilyForm) => {
    await createFamily.mutateAsync({
      name: data.name,
      managerEmail: data.managerEmail,
    });
    setDialogOpen(false);
    form.reset();
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <AppLayout title="Administração">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Painel Admin</h2>
              <p className="text-muted-foreground">
                Gerencie famílias e gestores do sistema
              </p>
            </div>

            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Família
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{families.length}</p>
                    <p className="text-sm text-muted-foreground">Famílias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Families List */}
          <div>
            <h3 className="font-semibold mb-4">Famílias Cadastradas</h3>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : families.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma família cadastrada ainda.</p>
                  <p className="text-sm">Crie a primeira família para começar!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {families.map((family) => (
                  <FamilyCard key={family.id} family={family} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Family Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Família</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Família</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Família Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Gestor</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="gestor@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createFamily.isPending}
                  >
                    Criar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </AuthGuard>
  );
}
