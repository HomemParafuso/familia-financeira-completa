import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, X, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FamilyInvite, AppRole } from '@/types/database';
import { useCancelInvite } from '@/hooks/useFamily';

interface PendingInvitesProps {
  invites: FamilyInvite[];
  isLoading: boolean;
}

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  family_manager: 'Gestor',
  family_member: 'Membro',
};

export function PendingInvites({ invites, isLoading }: PendingInvitesProps) {
  const cancelInvite = useCancelInvite();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum convite pendente
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{invite.email}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Expira em{' '}
                    {format(new Date(invite.expires_at), "dd 'de' MMM", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {roleLabels[invite.role]}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => cancelInvite.mutate(invite.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
