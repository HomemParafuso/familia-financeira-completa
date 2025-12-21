import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Users,
  Crown,
  UserCheck,
  MoreHorizontal,
  Trash2,
  Settings,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Profile, AppRole } from '@/types/database';
import { useRemoveMember } from '@/hooks/useFamily';
import { useAuth } from '@/contexts/AuthContext';

interface MemberListProps {
  members: (Profile & { role: AppRole })[];
  isLoading: boolean;
  onManagePermissions: (member: Profile & { role: AppRole }) => void;
}

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  family_manager: 'Gestor',
  family_member: 'Membro',
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-primary/10 text-primary border-primary/30',
  family_manager: 'bg-revenue/10 text-revenue border-revenue/30',
  family_member: 'bg-muted text-muted-foreground border-muted',
};

export function MemberList({ members, isLoading, onManagePermissions }: MemberListProps) {
  const [removeId, setRemoveId] = useState<string | null>(null);
  const { user, family } = useAuth();
  const removeMutation = useRemoveMember();

  const handleRemove = async () => {
    if (removeId && family) {
      await removeMutation.mutateAsync({ userId: removeId, familyId: family.id });
      setRemoveId(null);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum membro na família ainda.</p>
        <p className="text-sm">Envie convites para adicionar membros!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(member.full_name, member.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.full_name || member.email}</p>
                    {member.role === 'family_manager' && (
                      <Crown className="h-4 w-4 text-revenue" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn(roleColors[member.role])}>
                  {roleLabels[member.role]}
                </Badge>

                {member.id !== user?.id && member.role !== 'family_manager' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onManagePermissions(member)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Permissões
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setRemoveId(member.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este membro da família? Ele perderá
              acesso a todos os dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
