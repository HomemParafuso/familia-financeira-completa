import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { family } = useAuth();

  return (
    <AuthGuard requireFamily>
      <AppLayout title="Dashboard">
        <div className="space-y-6 animate-fade-in">
          {/* Welcome */}
          <div>
            <h2 className="font-display text-2xl font-bold">
              Olá! Bem-vindo ao {family?.name || 'FinFamily'}
            </h2>
            <p className="text-muted-foreground">
              Acompanhe a projeção financeira anual da sua família
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receitas Anuais
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-revenue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-revenue">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Projeção 2025</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Despesas Anuais
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Projeção 2025</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Projetado
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Resultado anual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meses em Alerta
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Com saldo negativo</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Anual</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
              Adicione receitas e despesas para visualizar o gráfico
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
