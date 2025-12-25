import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialProjection } from '@/hooks/useFinancialProjection';
import { ProjectionChart } from '@/components/dashboard/ProjectionChart';
import { ExpenseBreakdown } from '@/components/dashboard/KPICards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: transactions = [], isLoading } = useTransactions(selectedYear);
  const projection = useFinancialProjection(transactions, selectedYear);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <AuthGuard requireFamily>
        <AppLayout title="Relatórios">
          <div className="space-y-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-96" />
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireFamily>
      <AppLayout title="Relatórios">
        <div className="space-y-6 animate-fade-in">
          {/* Header with Year Selector */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Relatórios Financeiros
              </h2>
              <p className="text-muted-foreground">
                Visão consolidada do ano de {selectedYear}
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

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Receitas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-revenue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-revenue">
                  {formatCurrency(projection.totalRevenues)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Despesas
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">
                  {formatCurrency(projection.totalExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Anual
                </CardTitle>
                <Wallet className={cn('h-4 w-4', projection.annualBalance >= 0 ? 'text-revenue' : 'text-expense')} />
              </CardHeader>
              <CardContent>
                <div className={cn('text-2xl font-bold', projection.annualBalance >= 0 ? 'text-revenue' : 'text-expense')}>
                  {formatCurrency(projection.annualBalance)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProjectionChart projections={projection.monthlyProjections} year={selectedYear} />
            </div>
            <ExpenseBreakdown projection={projection} />
          </div>

          {/* Monthly Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Mês</th>
                      <th className="text-right py-3 px-2 font-medium text-revenue">Receitas</th>
                      <th className="text-right py-3 px-2 font-medium text-expense">Despesas</th>
                      <th className="text-right py-3 px-2 font-medium">Saldo</th>
                      <th className="text-right py-3 px-2 font-medium">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projection.monthlyProjections.map((month) => (
                      <tr key={month.month} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 capitalize">{month.monthName}</td>
                        <td className="py-3 px-2 text-right text-revenue">
                          {formatCurrency(month.revenues)}
                        </td>
                        <td className="py-3 px-2 text-right text-expense">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className={cn('py-3 px-2 text-right font-medium', month.balance >= 0 ? 'text-revenue' : 'text-expense')}>
                          {formatCurrency(month.balance)}
                        </td>
                        <td className={cn('py-3 px-2 text-right', month.accumulatedBalance >= 0 ? 'text-revenue' : 'text-expense')}>
                          {formatCurrency(month.accumulatedBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-muted/30">
                      <td className="py-3 px-2">Total</td>
                      <td className="py-3 px-2 text-right text-revenue">
                        {formatCurrency(projection.totalRevenues)}
                      </td>
                      <td className="py-3 px-2 text-right text-expense">
                        {formatCurrency(projection.totalExpenses)}
                      </td>
                      <td className={cn('py-3 px-2 text-right', projection.annualBalance >= 0 ? 'text-revenue' : 'text-expense')}>
                        {formatCurrency(projection.annualBalance)}
                      </td>
                      <td className="py-3 px-2 text-right">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
