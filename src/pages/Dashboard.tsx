import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialProjection } from '@/hooks/useFinancialProjection';
import { KPICards, ExpenseBreakdown } from '@/components/dashboard/KPICards';
import { ProjectionChart } from '@/components/dashboard/ProjectionChart';

export default function DashboardPage() {
  const { family } = useAuth();
  const currentYear = new Date().getFullYear();
  const { data: transactions = [] } = useTransactions(currentYear);
  const projection = useFinancialProjection(transactions, currentYear);

  return (
    <AuthGuard requireFamily>
      <AppLayout title="Dashboard">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Olá! Bem-vindo ao {family?.name || 'FinFamily'}
            </h2>
            <p className="text-muted-foreground">
              Acompanhe a projeção financeira anual da sua família
            </p>
          </div>

          <KPICards projection={projection} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProjectionChart projections={projection.monthlyProjections} year={currentYear} />
            </div>
            <ExpenseBreakdown projection={projection} />
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
