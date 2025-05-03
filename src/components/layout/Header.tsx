
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import AdminBadge from './AdminBadge';
import NotificationsDropdown from './NotificationsDropdown';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  
  // Get the initial for avatar
  const getInitial = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-background px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 lg:hidden" 
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold tracking-tight">Finanças Familiares</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        
        <div className="flex items-center gap-4">
          <AdminBadge />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0" aria-label="Menu de usuário">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{getInitial()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <button 
                  className="cursor-pointer w-full text-left" 
                  onClick={logout}
                >
                  Sair
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
