import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireFamily?: boolean;
}

export function AuthGuard({ children, allowedRoles, requireFamily = false }: AuthGuardProps) {
  const navigate = useNavigate();
  const { user, role, family, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        navigate('/auth');
        return;
      }

      // Still loading profile data - wait
      if (user && !profile && !role) {
        return;
      }

      // Role not allowed
      if (allowedRoles && role && !allowedRoles.includes(role)) {
        navigate('/dashboard');
        return;
      }

      // Family required but not set (and not admin)
      if (requireFamily && !family && role !== 'admin') {
        navigate('/onboarding');
        return;
      }
    }
  }, [user, role, family, profile, loading, navigate, allowedRoles, requireFamily]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
