
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AdminBadge = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') return null;
  
  return (
    <Badge className="bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1">
      <ShieldCheck className="h-3 w-3" />
      Administrador
    </Badge>
  );
};

export default AdminBadge;
