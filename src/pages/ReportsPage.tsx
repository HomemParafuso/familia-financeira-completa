import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroup } from '@/contexts/GroupContext';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ReportsPage: React.FC = () => {
  const { transactions, categories, summary, isLoading } = useFinance();
  const { currentGroup, canUserPerform, getUserReport, exportReport } = useGroup();
  const [reportType, setReportType] = useState('expenses');
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');

  // Obter membros do grupo atual
  const groupMembers = currentGroup?.members || [];
  const isGroupAdmin = currentGroup?.members.some(m => 
    m.userId === currentGroup.ownerId && m.role === 'admin'
  );
  
  const canViewAllReports = canUserPerform('view_reports');

  // Manipulador para exportar relatórios
  const handleExport = (format: 'pdf' | 'excel' | 'ofx') => {
    exportReport(format);
    toast.success(`Relatório exportado em formato ${format.toUpperCase()}`);
  };

  if (isLoading || !summary) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-finance-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Formatter for currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Format month names for the chart
  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
  };

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-md rounded-md">
          <p className="font-medium">{`${formatMonth(label)} ${label.split('-')[0]}`}</p>
          <p className="text-sm text-emerald-500">{`Receitas: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-sm text-red-500">{`Despesas: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-sm font-medium">{`Saldo: ${formatCurrency(payload[0].value - payload[1].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Visualize seus dados financeiros</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Seletor de membros - apenas para administradores ou com permissão */}
          {canViewAllReports && groupMembers.length > 0 && (
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por membro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os membros</SelectItem>
                {groupMembers.map(member => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Menu de exportação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Exportar</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Exportar como PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Exportar como Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('ofx')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Exportar como OFX</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Evolução Mensal</TabsTrigger>
          <TabsTrigger value="category">Categorias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal de Receitas e Despesas</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.monthlySummary}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                  />
                  <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    name="Receitas" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    name="Despesas" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Receitas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">
                  {summary.totalIncome.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Despesas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {summary.totalExpenses.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {summary.balance.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="category">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.categorySummary}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                    >
                      {summary.categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Principais Categorias de Despesa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.categorySummary.slice(0, 5).map((cat, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{cat.category}</span>
                        <span className="font-medium">{formatCurrency(cat.amount)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={{
                            width: `${cat.percentage}%`, 
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">{cat.percentage.toFixed(1)}% do total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ReportsPage;
