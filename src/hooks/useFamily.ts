import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Family, Profile, FamilyInvite, FamilyMemberPermissions, AppRole } from '@/types/database';
import { toast } from 'sonner';

// Fetch all families (admin only)
export function useFamilies() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Family[];
    },
    enabled: role === 'admin',
  });
}

// Create a new family (admin only)
export function useCreateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, managerEmail, password }: { name: string; managerEmail: string; password: string }) => {
      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({ name })
        .select()
        .single();

      if (familyError) throw familyError;

      // Check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', managerEmail)
        .maybeSingle();

      if (existingProfile) {
        // User exists - assign them to family and give manager role
        await supabase
          .from('profiles')
          .update({ family_id: family.id })
          .eq('id', existingProfile.id);

        await supabase
          .from('user_roles')
          .upsert({ user_id: existingProfile.id, role: 'family_manager' as AppRole });
      } else {
        // Create new user with provided password
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: managerEmail,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: `Gestor - ${name}`,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Wait a bit for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Assign to family
          await supabase
            .from('profiles')
            .update({ family_id: family.id })
            .eq('id', signUpData.user.id);

          // Assign manager role
          await supabase
            .from('user_roles')
            .insert({ user_id: signUpData.user.id, role: 'family_manager' as AppRole });
        }
      }

      return family;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast.success('Família criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating family:', error);
      toast.error('Erro ao criar família');
    },
  });
}

// Fetch family members
export function useFamilyMembers(familyId?: string) {
  return useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', familyId);

      if (error) throw error;

      // Fetch roles separately
      const userIds = data.map((p) => p.id);
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const rolesMap = new Map(rolesData?.map((r) => [r.user_id, r.role]) || []);

      return data.map((profile) => ({
        ...profile,
        role: rolesMap.get(profile.id) || 'family_member',
      })) as (Profile & { role: AppRole })[];
    },
    enabled: !!familyId,
  });
}

// Fetch family invites
export function useFamilyInvites(familyId?: string) {
  return useQuery({
    queryKey: ['family-invites', familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from('family_invites')
        .select('*')
        .eq('family_id', familyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FamilyInvite[];
    },
    enabled: !!familyId,
  });
}

// Create invite
export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { user, family } = useAuth();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      if (!user || !family) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_invites')
        .insert({
          family_id: family.id,
          email,
          invited_by: user.id,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-invites'] });
      toast.success('Convite enviado!');
    },
    onError: (error) => {
      console.error('Error creating invite:', error);
      toast.error('Erro ao enviar convite');
    },
  });
}

// Cancel invite
export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('family_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-invites'] });
      toast.success('Convite cancelado');
    },
    onError: (error) => {
      console.error('Error canceling invite:', error);
      toast.error('Erro ao cancelar convite');
    },
  });
}

// Fetch member permissions
export function useMemberPermissions(userId?: string, familyId?: string) {
  return useQuery({
    queryKey: ['member-permissions', userId, familyId],
    queryFn: async () => {
      if (!userId || !familyId) return null;

      const { data, error } = await supabase
        .from('family_member_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('family_id', familyId)
        .maybeSingle();

      if (error) throw error;
      return data as FamilyMemberPermissions | null;
    },
    enabled: !!userId && !!familyId,
  });
}

// Update member permissions
export function useUpdateMemberPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      familyId,
      permissions,
    }: {
      userId: string;
      familyId: string;
      permissions: Partial<FamilyMemberPermissions>;
    }) => {
      const { data, error } = await supabase
        .from('family_member_permissions')
        .upsert({
          user_id: userId,
          family_id: familyId,
          ...permissions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-permissions'] });
      toast.success('Permissões atualizadas!');
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      toast.error('Erro ao atualizar permissões');
    },
  });
}

// Remove member from family
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, familyId }: { userId: string; familyId: string }) => {
      // Remove from family
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ family_id: null })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Remove permissions
      await supabase
        .from('family_member_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('family_id', familyId);

      // Remove role if family_member
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'family_member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast.success('Membro removido da família');
    },
    onError: (error) => {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    },
  });
}

// Accept invite
export function useAcceptInvite() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (invite: FamilyInvite) => {
      if (!user) throw new Error('Not authenticated');

      // Update invite status
      await supabase
        .from('family_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      // Assign user to family
      await supabase
        .from('profiles')
        .update({ family_id: invite.family_id })
        .eq('id', user.id);

      // Set role
      await supabase
        .from('user_roles')
        .upsert({ user_id: user.id, role: invite.role });

      // Create default permissions for family_member
      if (invite.role === 'family_member') {
        await supabase
          .from('family_member_permissions')
          .insert({
            user_id: user.id,
            family_id: invite.family_id,
          });
      }
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      toast.success('Convite aceito! Bem-vindo à família.');
    },
    onError: (error) => {
      console.error('Error accepting invite:', error);
      toast.error('Erro ao aceitar convite');
    },
  });
}

// Fetch pending invites for current user
export function usePendingInvites() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['pending-invites', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];

      const { data, error } = await supabase
        .from('family_invites')
        .select('*, families(name)')
        .eq('email', profile.email)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.email,
  });
}
