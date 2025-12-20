import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, PiggyBank, Receipt } from 'lucide-react';
import { AnnualProjection } from '@/types/database';

interface KPICardsProps {
  projection: AnnualProjection;
}

export function KPICards({ projection }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const alertMonths = projection.monthlyProjections.filter(
    (m) => m.balance < 0
  ).length;

  const cards = [
    {
      title: 'Receitas Anuais',
      value: projection.totalRevenues,
      icon: TrendingUp,
      color: 'text-revenue',
      bgColor: 'bg-revenue/10',
      subtitle: `Projeção ${projection.year}`,
    },
    {
      title: 'Despesas Anuais',
      value: projection.totalExpenses,
      icon: TrendingDown,
      color: 'text-expense',
      bgColor: 'bg-expense/10',
      subtitle: `Projeção ${projection.year}`,
    },
    {
      title: 'Saldo Projetado',
      value: projection.annualBalance,
      icon: Wallet,
      color: projection.annualBalance >= 0 ? 'text-revenue' : 'text-expense',
      bgColor: projection.annualBalance >= 0 ? 'bg-revenue/10' : 'bg-expense/10',
      subtitle: 'Resultado anual',
    },
    {
      title: 'Meses em Alerta',
      value: alertMonths,
      icon: AlertTriangle,
      color: alertMonths > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: alertMonths > 0 ? 'bg-warning/10' : 'bg-muted/10',
      subtitle: 'Com saldo negativo',
      isCount: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn('p-2 rounded-full', card.bgColor)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', card.color)}>
              {card.isCount ? card.value : formatCurrency(card.value)}
            </div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ExpenseBreakdownProps {
  projection: AnnualProjection;
}

export function ExpenseBreakdown({ projection }: ExpenseBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = projection.totalExpenses || 1;
  const basicPercent = ((projection.totalBasicExpenses / total) * 100).toFixed(0);
  const financingPercent = ((projection.totalFinancingExpenses / total) * 100).toFixed(0);
  const eventualPercent = ((projection.totalEventualExpenses / total) * 100).toFixed(0);

  const groups = [
    {
      label: 'Básicas',
      value: projection.totalBasicExpenses,
      percent: basicPercent,
      color: 'bg-expense-basic',
      textColor: 'text-expense-basic',
    },
    {
      label: 'Financiamentos',
      value: projection.totalFinancingExpenses,
      percent: financingPercent,
      color: 'bg-expense-financing',
      textColor: 'text-expense-financing',
    },
    {
      label: 'Eventuais',
      value: projection.totalEventualExpenses,
      percent: eventualPercent,
      color: 'bg-expense-eventual',
      textColor: 'text-expense-eventual',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Composição das Despesas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className={cn('font-medium', group.textColor)}>
                {group.label}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(group.value)} ({group.percent}%)
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', group.color)}
                style={{ width: `${group.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
