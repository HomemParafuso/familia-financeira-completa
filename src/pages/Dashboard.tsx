import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialProjection } from '@/hooks/useFinancialProjection';
import { ProjectionChart } from '@/components/dashboard/ProjectionChart';
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Receipt
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Transaction, TransactionType } from '@/types/database';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { family, role } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const { data: transactions = [], isLoading } = useTransactions(selectedYear);
  const projection = useFinancialProjection(transactions, selectedYear);
  
  // Transaction form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<TransactionType>('expense');

  // Get current month projection
  const currentMonthProjection = projection.monthlyProjections[selectedMonth];

  // Admin without family - show admin-specific dashboard
  const isAdminWithoutFamily = role === 'admin' && !family;

  const today = new Date();

  // Get upcoming due transactions for selected month (next 7 days from today if current month)
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const handleNewTransaction = (type: TransactionType) => {
    setDefaultType(type);
    setDialogOpen(true);
  };

  // Admin without family - redirect to admin panel or show simplified view
  if (isAdminWithoutFamily) {
    return (
      <AuthGuard>
        <AppLayout title="Dashboard">
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Painel Administrativo
              </h2>
              <p className="text-muted-foreground">
                Você está logado como administrador do sistema
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Gerenciar Famílias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visualize e gerencie todas as famílias cadastradas no sistema.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    Acesso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Use o menu lateral para acessar o Painel Admin e gerenciar o sistema.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

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
          {/* Header with Month Selector and Action Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Olá! Bem-vindo ao {family?.name || 'FinFamily'}
                </h2>
                <p className="text-muted-foreground">
                  Acompanhe as finanças do mês
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[140px] text-center font-semibold text-lg">
                  {MONTH_NAMES[selectedMonth]} {selectedYear}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleNewTransaction('revenue')}
                className="bg-revenue hover:bg-revenue/90"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
              <Button
                onClick={() => handleNewTransaction('expense')}
                className="bg-expense hover:bg-expense/90"
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </div>
          </div>

          {/* Monthly KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receitas do Mês
                </CardTitle>
                <div className="p-2 rounded-full bg-revenue/10">
                  <TrendingUp className="h-4 w-4 text-revenue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-revenue">
                  {formatCurrency(currentMonthProjection?.revenues || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{MONTH_NAMES[selectedMonth]}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Despesas do Mês
                </CardTitle>
                <div className="p-2 rounded-full bg-expense/10">
                  <TrendingDown className="h-4 w-4 text-expense" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">
                  {formatCurrency(currentMonthProjection?.expenses || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{MONTH_NAMES[selectedMonth]}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo do Mês
                </CardTitle>
                <div className={cn('p-2 rounded-full', (currentMonthProjection?.balance || 0) >= 0 ? 'bg-revenue/10' : 'bg-expense/10')}>
                  <Wallet className={cn('h-4 w-4', (currentMonthProjection?.balance || 0) >= 0 ? 'text-revenue' : 'text-expense')} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn('text-2xl font-bold', (currentMonthProjection?.balance || 0) >= 0 ? 'text-revenue' : 'text-expense')}>
                  {formatCurrency(currentMonthProjection?.balance || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Resultado mensal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Acumulado
                </CardTitle>
                <div className={cn('p-2 rounded-full', (currentMonthProjection?.accumulatedBalance || 0) >= 0 ? 'bg-revenue/10' : 'bg-expense/10')}>
                  <Receipt className={cn('h-4 w-4', (currentMonthProjection?.accumulatedBalance || 0) >= 0 ? 'text-revenue' : 'text-expense')} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn('text-2xl font-bold', (currentMonthProjection?.accumulatedBalance || 0) >= 0 ? 'text-revenue' : 'text-expense')}>
                  {formatCurrency(currentMonthProjection?.accumulatedBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Até {MONTH_NAMES[selectedMonth]}</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Expense Breakdown */}
          {currentMonthProjection && currentMonthProjection.expenses > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Despesas de {MONTH_NAMES[selectedMonth]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Básicas', value: currentMonthProjection.basicExpenses, color: 'bg-expense-basic', textColor: 'text-expense-basic' },
                  { label: 'Financiamentos', value: currentMonthProjection.financingExpenses, color: 'bg-expense-financing', textColor: 'text-expense-financing' },
                  { label: 'Eventuais', value: currentMonthProjection.eventualExpenses, color: 'bg-expense-eventual', textColor: 'text-expense-eventual' },
                ].map((group, index) => {
                  const percent = currentMonthProjection.expenses > 0 
                    ? ((group.value / currentMonthProjection.expenses) * 100).toFixed(0)
                    : '0';
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={cn('font-medium', group.textColor)}>
                          {group.label}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(group.value)} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', group.color)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Annual Chart */}
          <ProjectionChart projections={projection.monthlyProjections} year={selectedYear} />

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

        {/* Transaction Form Dialog */}
        <TransactionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultType={defaultType}
        />
      </AppLayout>
    </AuthGuard>
  );
}
