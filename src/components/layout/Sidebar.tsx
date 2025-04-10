
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  LineChart,
  ListTodo,
  PieChart,
  Settings,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { currentGroup, groups } = useGroup();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Visão Geral',
      icon: <LineChart size={20} />,
      href: '/dashboard',
    },
    {
      title: 'Transações',
      icon: <CreditCard size={20} />,
      href: '/transactions',
    },
    {
      title: 'Orçamentos',
      icon: <Wallet size={20} />,
      href: '/budgets',
    },
    {
      title: 'Categorias',
      icon: <ListTodo size={20} />,
      href: '/categories',
    },
    {
      title: 'Relatórios',
      icon: <PieChart size={20} />,
      href: '/reports',
    },
    {
      title: 'Grupos',
      icon: <Users size={20} />,
      href: '/groups',
    },
    {
      title: 'Configurações',
      icon: <Settings size={20} />,
      href: '/settings',
    },
  ];

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border shadow-lg transition-transform duration-300 ease-in-out lg:shadow-none lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-finance-primary" />
          <span className="font-bold text-xl">Finanças Família</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <XCircle className="h-5 w-5" />
        </Button>
      </div>
      
      {user && currentGroup && (
        <div className="px-4 py-2 bg-sidebar-accent">
          <p className="text-sm font-medium">Grupo atual:</p>
          <p className="font-semibold truncate">{currentGroup.name}</p>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                location.pathname === item.href
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground'
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
        
        {groups.length > 1 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1 py-2">
              <h3 className="px-3 text-sm font-medium">Seus grupos</h3>
              {groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                    currentGroup?.id === group.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-sidebar-foreground'
                  )}
                >
                  <Users className="mr-3 h-4 w-4" />
                  <span className="truncate">{group.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="font-medium text-sm">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
              <div className="space-y-0.5 flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
              </div>
            </>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
