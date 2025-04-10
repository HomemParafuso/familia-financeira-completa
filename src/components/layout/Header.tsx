
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  CreditCard, 
  LogOut, 
  Menu, 
  PieChart, 
  Settings, 
  User, 
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Menu />
          </Button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-finance-primary" />
            <span className="font-bold text-xl text-finance-dark hidden md:inline-block">
              Finanças Família
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                aria-label="Notificações"
              >
                <Bell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-finance-danger rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                <div className="p-3 hover:bg-accent rounded-md cursor-pointer">
                  <div className="font-medium">Nova transação adicionada</div>
                  <div className="text-sm text-muted-foreground">Maria adicionou uma nova despesa</div>
                  <div className="text-xs text-muted-foreground mt-1">Há 10 minutos</div>
                </div>
                <div className="p-3 hover:bg-accent rounded-md cursor-pointer">
                  <div className="font-medium">Alerta de orçamento</div>
                  <div className="text-sm text-muted-foreground">Você atingiu 90% do orçamento de Alimentação</div>
                  <div className="text-xs text-muted-foreground mt-1">Há 2 horas</div>
                </div>
                <div className="p-3 hover:bg-accent rounded-md cursor-pointer">
                  <div className="font-medium">Lembrete de pagamento</div>
                  <div className="text-sm text-muted-foreground">O pagamento de Aluguel vence amanhã</div>
                  <div className="text-xs text-muted-foreground mt-1">Há 5 horas</div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <Button variant="ghost" className="w-full text-xs">Ver todas</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Perfil">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || "Avatar"} />
                  <AvatarFallback>{user ? getInitials(user.name) : "?"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/groups" className="flex items-center cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Grupos</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reports" className="flex items-center cursor-pointer">
                  <PieChart className="mr-2 h-4 w-4" />
                  <span>Relatórios</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer" 
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
