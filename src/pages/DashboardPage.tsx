
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/Dashboard';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import ExpensesByCategory from '@/components/dashboard/ExpensesByCategory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useGroup } from '@/contexts/GroupContext';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions } = useFinance();
  const { canUserPerform } = useGroup();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Check if user has permission to add transactions
  const canAddExpenses = canUserPerform('add_expenses');
  const canAddIncome = canUserPerform('add_income');
  const canAddTransactions = canAddExpenses || canAddIncome;

  // Handle new transaction click
  const handleNewTransaction = () => {
    if (!canAddTransactions) {
      toast.error("Você não tem permissão para adicionar transações");
      return;
    }
    navigate('/transactions', { state: { openAddDialog: true } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Olá, {user?.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel financeiro
            </p>
          </div>
          <Button 
            className="bg-finance-primary hover:bg-finance-primary/90"
            onClick={handleNewTransaction}
          >
            <Plus className="mr-1 h-4 w-4" />
            Nova Transação
          </Button>
        </div>
        
        <DashboardSummary />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <IncomeExpenseChart />
          <ExpensesByCategory />
        </div>
        
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-md bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className={transaction.type === 'income' ? 'text-finance-success' : 'text-finance-danger'}>
                      {transaction.type === 'income' ? '+ ' : '- '}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate('/transactions')}>
                  Ver todas as transações
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhuma transação recente</p>
                <Button 
                  className="mt-4 bg-finance-primary hover:bg-finance-primary/90"
                  onClick={handleNewTransaction}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar Transação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
