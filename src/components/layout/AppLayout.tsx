import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/revenues': 'Receitas',
  '/expenses/basic': 'Despesas Básicas',
  '/expenses/financing': 'Financiamentos',
  '/expenses/eventual': 'Despesas Eventuais',
  '/reports': 'Relatórios',
  '/family/members': 'Membros da Família',
  '/family/permissions': 'Permissões',
  '/admin/managers': 'Gestores',
  '/admin/settings': 'Configurações',
};

export function AppLayout({ children, title }: AppLayoutProps) {
  const location = useLocation();
  const pageTitle = title || routeTitles[location.pathname] || 'FinFamily';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-display font-medium">
                  {pageTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
