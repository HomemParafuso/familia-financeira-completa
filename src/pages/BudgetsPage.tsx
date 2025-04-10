
import React from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const BudgetsPage: React.FC = () => {
  const { budgets, categories, isLoading } = useFinance();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-finance-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos mensais por categoria</p>
        </div>
        <Button className="bg-finance-primary hover:bg-finance-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          const progress = (budget.spent / budget.amount) * 100;
          const isOverBudget = budget.spent > budget.amount;

          return (
            <Card key={budget.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: category?.color || '#ccc' }} 
                    />
                    <CardTitle>{category?.name || 'Categoria'}</CardTitle>
                  </div>
                  <div className="text-sm font-medium">
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                  </div>
                </div>
                <CardDescription>
                  {new Date(budget.startDate).toLocaleDateString('pt-BR')}
                  {budget.endDate ? ` até ${new Date(budget.endDate).toLocaleDateString('pt-BR')}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gasto: {budget.spent.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}</span>
                    <span className="text-sm font-medium">
                      de {budget.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </div>
                  <Progress
                    value={progress > 100 ? 100 : progress}
                    className={isOverBudget ? "bg-red-200" : ""}
                  />
                  {isOverBudget && (
                    <div className="text-xs text-red-500 font-medium">
                      Orçamento excedido em {(budget.spent - budget.amount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
            <p className="mb-4 text-muted-foreground">Você ainda não criou nenhum orçamento.</p>
            <Button className="bg-finance-primary hover:bg-finance-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro orçamento
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BudgetsPage;
