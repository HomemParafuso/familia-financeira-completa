
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';

const IncomeExpenseChart: React.FC = () => {
  const { summary } = useFinance();
  
  if (!summary) {
    return (
      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="animate-pulse bg-muted/30 h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = summary.monthlySummary.map(item => ({
    name: item.month.substring(5), // Extract month part (MM) from YYYY-MM format
    Receitas: item.income,
    Despesas: item.expenses,
  })).slice(-12); // Get up to 12 months of data

  return (
    <Card className="finance-card">
      <CardHeader>
        <CardTitle>Receitas vs Despesas</CardTitle>
        <CardDescription>Comparativo mensal</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(Number(value))}
              />
              <Legend />
              <Bar name="Receitas" dataKey="Receitas" fill="#2ecc71" />
              <Bar name="Despesas" dataKey="Despesas" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado mensal disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
