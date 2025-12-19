import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [familyName, setFamilyName] = useState('');

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !familyName.trim()) return;

    setLoading(true);
    try {
      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({ name: familyName.trim() })
        .select()
        .single();

      if (familyError) throw familyError;

      // Update profile with family_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ family_id: family.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Assign family_manager role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'family_manager' });

      if (roleError) throw roleError;

      await refreshProfile();
      toast({ title: 'Família criada!', description: 'Você agora é o gestor da família.' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Bem-vindo ao FinFamily!</h1>
          <p className="text-center text-muted-foreground">Vamos configurar sua família</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Criar Família
            </CardTitle>
            <CardDescription>
              Crie sua família para começar a organizar as finanças. Você será o gestor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family-name">Nome da família</Label>
                <Input
                  id="family-name"
                  placeholder="Ex: Família Silva"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar família'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
