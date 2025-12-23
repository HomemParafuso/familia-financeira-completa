import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialProjection } from '@/hooks/useFinancialProjection';
import { KPICards, ExpenseBreakdown } from '@/components/dashboard/KPICards';
import { ProjectionChart } from '@/components/dashboard/ProjectionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { family } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: transactions = [], isLoading } = useTransactions(selectedYear);
  const projection = useFinancialProjection(transactions, selectedYear);

  const today = new Date();

  // Get upcoming due transactions (next 7 days)
  const upcomingTransactions = transactions
    .filter((t) => {
      if (t.is_paid) return false;
      const dueDate = parseISO(t.due_date);
      const daysUntilDue = differenceInDays(dueDate, today);
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    })
    .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())
    .slice(0, 5);

  // Get overdue transactions
  const overdueTransactions = transactions
    .filter((t) => {
      if (t.is_paid) return false;
      const dueDate = parseISO(t.due_date);
      return dueDate < today;
    })
    .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <AuthGuard requireFamily>
        <AppLayout title="Dashboard">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireFamily>
      <AppLayout title="Dashboard">
        <div className="space-y-6 animate-fade-in">
          {/* Header with Year Selector */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Olá! Bem-vindo ao {family?.name || 'FinFamily'}
              </h2>
              <p className="text-muted-foreground">
                Acompanhe a projeção financeira anual da sua família
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear((y) => y - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[80px] text-center font-semibold text-lg">
                {selectedYear}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear((y) => y + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards projection={projection} />

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProjectionChart projections={projection.monthlyProjections} year={selectedYear} />
            </div>
            <ExpenseBreakdown projection={projection} />
          </div>

          {/* Alerts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overdue Transactions */}
            <Card className={cn(overdueTransactions.length > 0 && 'border-destructive/50')}>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertCircle className={cn('h-5 w-5', overdueTransactions.length > 0 ? 'text-destructive' : 'text-muted-foreground')} />
                <CardTitle className="text-base">Contas Vencidas</CardTitle>
                {overdueTransactions.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {overdueTransactions.length}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {overdueTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma conta vencida. Parabéns!
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {overdueTransactions.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2"
                        onClick={() => navigate('/transactions')}
                      >
                        <div>
                          <span className="font-medium">{t.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {format(parseISO(t.due_date), "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        </div>
                        <span className="text-destructive font-medium">
                          {formatCurrency(Number(t.amount))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Clock className="h-5 w-5 text-warning" />
                <CardTitle className="text-base">Próximos Vencimentos</CardTitle>
                {upcomingTransactions.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {upcomingTransactions.length}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {upcomingTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum vencimento nos próximos 7 dias.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {upcomingTransactions.map((t) => {
                      const daysUntil = differenceInDays(parseISO(t.due_date), today);
                      return (
                        <li
                          key={t.id}
                          className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2"
                          onClick={() => navigate('/transactions')}
                        >
                          <div>
                            <span className="font-medium">{t.name}</span>
                            <span className={cn(
                              'ml-2',
                              daysUntil <= 2 ? 'text-warning' : 'text-muted-foreground'
                            )}>
                              {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`}
                            </span>
                          </div>
                          <span className={cn(
                            'font-medium',
                            t.type === 'revenue' ? 'text-revenue' : 'text-expense'
                          )}>
                            {formatCurrency(Number(t.amount))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
