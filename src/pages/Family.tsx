import { useState } from 'react';
import { UserPlus, Users, Mail, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberList } from '@/components/family/MemberList';
import { InviteDialog } from '@/components/family/InviteDialog';
import { PermissionsDialog } from '@/components/family/PermissionsDialog';
import { PendingInvites } from '@/components/family/PendingInvites';
import { useFamilyMembers, useFamilyInvites } from '@/hooks/useFamily';
import { useAuth } from '@/contexts/AuthContext';
import { Profile, AppRole } from '@/types/database';

export default function FamilyPage() {
  const { family, role } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<(Profile & { role: AppRole }) | null>(null);

  const { data: members = [], isLoading: membersLoading } = useFamilyMembers(family?.id);
  const { data: invites = [], isLoading: invitesLoading } = useFamilyInvites(family?.id);

  const isManager = role === 'family_manager' || role === 'admin';

  const handleManagePermissions = (member: Profile & { role: AppRole }) => {
    setSelectedMember(member);
    setPermissionsDialogOpen(true);
  };

  return (
    <AuthGuard requireFamily allowedRoles={['family_manager', 'admin']}>
      <AppLayout title="Gestão Familiar">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">{family?.name}</h2>
              <p className="text-muted-foreground">
                Gerencie os membros e permissões da família
              </p>
            </div>

            {isManager && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Convidar Membro
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                Membros ({members.length})
              </TabsTrigger>
              <TabsTrigger value="invites" className="gap-2">
                <Mail className="h-4 w-4" />
                Convites ({invites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-6">
              <MemberList
                members={members}
                isLoading={membersLoading}
                onManagePermissions={handleManagePermissions}
              />
            </TabsContent>

            <TabsContent value="invites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Convites Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PendingInvites invites={invites} isLoading={invitesLoading} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
        <PermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          member={selectedMember}
          familyId={family?.id || ''}
        />
      </AppLayout>
    </AuthGuard>
  );
}
