
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';

const DashboardSummary: React.FC = () => {
  const { summary } = useFinance();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (!summary) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50" />
            <CardContent className="h-12 mt-2 bg-muted/30" />
            <CardFooter className="h-8 mt-2 bg-muted/20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card className="finance-card">
        <CardHeader className="pb-2">
          <CardDescription>Saldo Atual</CardDescription>
          <CardTitle className={summary.balance >= 0 ? 'text-finance-success' : 'text-finance-danger'}>
            {formatCurrency(summary.balance)}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-sm">
            Taxa de economia: {summary.savingsRate.toFixed(1)}%
          </p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between text-xs text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span>Atualizado hoje</span>
        </CardFooter>
      </Card>
      
      <Card className="finance-card">
        <CardHeader className="pb-2">
          <CardDescription>Receitas</CardDescription>
          <CardTitle className="text-finance-success">
            {formatCurrency(summary.totalIncome)}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex items-center">
            <ArrowUp className="h-4 w-4 text-finance-success mr-1" />
            <span className="text-sm">Total de receitas este mês</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 text-xs text-muted-foreground">
          {summary.monthlySummary.length > 0 &&
            `${summary.monthlySummary.length} meses registrados`}
        </CardFooter>
      </Card>
      
      <Card className="finance-card">
        <CardHeader className="pb-2">
          <CardDescription>Despesas</CardDescription>
          <CardTitle className="text-finance-danger">
            {formatCurrency(summary.totalExpenses)}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex items-center">
            <ArrowDown className="h-4 w-4 text-finance-danger mr-1" />
            <span className="text-sm">Total de despesas este mês</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 text-xs text-muted-foreground">
          {summary.categorySummary.length > 0 &&
            `${summary.categorySummary.length} categorias de despesas`}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardSummary;
