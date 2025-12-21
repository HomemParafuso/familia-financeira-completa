import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMemberPermissions, useUpdateMemberPermissions } from '@/hooks/useFamily';
import { Profile, AppRole, FamilyMemberPermissions } from '@/types/database';

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: (Profile & { role: AppRole }) | null;
  familyId: string;
}

export function PermissionsDialog({
  open,
  onOpenChange,
  member,
  familyId,
}: PermissionsDialogProps) {
  const { data: permissions, isLoading } = useMemberPermissions(member?.id, familyId);
  const updatePermissions = useUpdateMemberPermissions();

  const [localPermissions, setLocalPermissions] = useState({
    can_view_all_transactions: false,
    can_create_transactions: true,
    can_edit_own_transactions: true,
    can_delete_own_transactions: false,
  });

  useEffect(() => {
    if (permissions) {
      setLocalPermissions({
        can_view_all_transactions: permissions.can_view_all_transactions,
        can_create_transactions: permissions.can_create_transactions,
        can_edit_own_transactions: permissions.can_edit_own_transactions,
        can_delete_own_transactions: permissions.can_delete_own_transactions,
      });
    }
  }, [permissions]);

  const handleSave = async () => {
    if (!member) return;

    await updatePermissions.mutateAsync({
      userId: member.id,
      familyId,
      permissions: localPermissions,
    });
    onOpenChange(false);
  };

  const togglePermission = (key: keyof typeof localPermissions) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!member) return null;

  const permissionItems = [
    {
      key: 'can_view_all_transactions' as const,
      label: 'Ver todas as transações',
      description: 'Pode visualizar transações de outros membros',
      icon: Eye,
    },
    {
      key: 'can_create_transactions' as const,
      label: 'Criar transações',
      description: 'Pode criar novas receitas e despesas',
      icon: PlusCircle,
    },
    {
      key: 'can_edit_own_transactions' as const,
      label: 'Editar próprias transações',
      description: 'Pode editar transações que criou',
      icon: Edit,
    },
    {
      key: 'can_delete_own_transactions' as const,
      label: 'Excluir próprias transações',
      description: 'Pode excluir transações que criou',
      icon: Trash2,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Permissões de {member.full_name || member.email}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {permissionItems.map((item, index) => (
            <div key={item.key}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label htmlFor={item.key} className="font-medium">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={item.key}
                  checked={localPermissions[item.key]}
                  onCheckedChange={() => togglePermission(item.key)}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={updatePermissions.isPending}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
