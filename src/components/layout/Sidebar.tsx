
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  CreditCard,
  Home,
  PieChart,
  Settings,
  Tag,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  // Define navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Transações',
      href: '/transactions',
      icon: CreditCard,
      current: location.pathname === '/transactions',
    },
    {
      name: 'Categorias',
      href: '/categories',
      icon: Tag,
      current: location.pathname === '/categories',
    },
    {
      name: 'Orçamentos',
      href: '/budgets',
      icon: PieChart,
      current: location.pathname === '/budgets',
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      current: location.pathname === '/reports',
    },
    {
      name: 'Grupos',
      href: '/groups',
      icon: Users,
      current: location.pathname === '/groups',
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out lg:translate-x-0 lg:border-r lg:shadow-none',
          isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-finance-primary" />
            <span className="text-xl font-semibold tracking-tight">Finanças Familiares</span>
          </div>
        </div>
        <nav className="space-y-1 px-2 py-6">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5',
                  item.current
                    ? 'text-foreground'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
