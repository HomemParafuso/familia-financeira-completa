
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle, 
  CreditCard, 
  LineChart, 
  Lock, 
  Users 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-finance-primary" />
            <span className="font-bold text-xl">Finanças Familiares</span>
          </div>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard" className="bg-finance-primary hover:bg-finance-primary/90">
                  Acessar Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register" className="bg-finance-primary hover:bg-finance-primary/90">
                    Cadastrar
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-accent/20 to-background">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Gerencie suas finanças em família com facilidade e segurança
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Acompanhe receitas e despesas, compartilhe o gerenciamento financeiro e 
            defina permissões para cada membro da família.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-finance-primary hover:bg-finance-primary/90">
              <Link to="/register">
                Começar agora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">
                Já tenho uma conta
              </Link>
            </Button>
          </div>
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-12 bottom-0 top-auto"></div>
            <img 
              src="/placeholder.svg" 
              alt="Dashboard Preview" 
              className="mx-auto rounded-lg shadow-xl border border-border" 
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Principais Recursos</h2>
            <p className="text-muted-foreground mt-2">
              Tudo o que você precisa para gerenciar suas finanças familiares
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <div className="h-12 w-12 bg-finance-primary/10 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Rastreamento Completo</h3>
              <p className="text-muted-foreground">
                Acompanhe receitas, despesas, investimentos e orçamentos em um único lugar.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <div className="h-12 w-12 bg-finance-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Gestão Compartilhada</h3>
              <p className="text-muted-foreground">
                Compartilhe o controle financeiro com membros da família com permissões personalizáveis.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <div className="h-12 w-12 bg-finance-primary/10 rounded-full flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Relatórios Interativos</h3>
              <p className="text-muted-foreground">
                Visualize seus dados financeiros com gráficos interativos e relatórios detalhados.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <div className="h-12 w-12 bg-finance-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Categorização Inteligente</h3>
              <p className="text-muted-foreground">
                Organize suas transações em categorias personalizáveis para melhor controle.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <div className="h-12 w-12 bg-finance-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Controle de Permissões</h3>
              <p className="text-muted-foreground">
                Defina quem pode ver, adicionar, editar ou excluir informações financeiras.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
              <div className="h-12 w-12 bg-finance-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Transações Recorrentes</h3>
              <p className="text-muted-foreground">
                Configure transações automáticas para despesas e receitas recorrentes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para controlar suas finanças em família?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Crie sua conta gratuitamente e comece a gerenciar suas finanças hoje mesmo.
            Não perca mais tempo com planilhas complicadas e desatualizadas.
          </p>
          <Button asChild size="lg" className="bg-finance-primary hover:bg-finance-primary/90">
            <Link to="/register">
              Criar conta grátis
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted/20 py-8 border-t border-border mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CreditCard className="h-5 w-5 text-finance-primary" />
              <span className="font-medium">Finanças Familiares</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Finanças Familiares. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
