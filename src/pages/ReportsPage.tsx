
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
import { FilePdf, FileText, Download, FileSpreadsheet } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ReportsPage: React.FC = () => {
  const { transactions, categories, summary, isLoading } = useFinance();
  const { currentGroup, canUserPerform, getUserReport } = useGroup();
  const [reportType, setReportType] = useState('expenses');
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Obter membros do grupo atual
  const groupMembers = currentGroup?.members || [];
  const isGroupAdmin = currentGroup?.members.some(m => 
    m.userId === currentGroup.ownerId && m.role === 'admin'
  );
  
  const canViewAllReports = canUserPerform('view_reports');

  // Função para gerar o conteúdo do relatório com base nos dados atuais
  const generateReportContent = () => {
    // Dados para o relatório
    const title = "Relatório Financeiro";
    const date = new Date().toLocaleDateString('pt-BR');
    const totalIncome = summary?.totalIncome || 0;
    const totalExpenses = summary?.totalExpenses || 0;
    const balance = summary?.balance || 0;
    
    // Informações do grupo
    const groupInfo = currentGroup 
      ? `Grupo: ${currentGroup.name}`
      : 'Finanças Pessoais';
      
    // Filtro de membro
    const memberFilter = selectedMemberId !== 'all' && currentGroup
      ? currentGroup.members.find(m => m.userId === selectedMemberId)?.name || 'Membro não encontrado'
      : 'Todos os membros';
    
    return {
      title,
      date,
      groupInfo,
      memberFilter,
      totalIncome,
      totalExpenses,
      balance,
      categorySummary: summary?.categorySummary || [],
      monthlySummary: summary?.monthlySummary || []
    };
  };
  
  // Função para exportar para PDF
  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const reportData = generateReportContent();
      
      // Criação do conteúdo do PDF utilizando uma string HTML
      const pdfContent = `
        <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .header { margin-bottom: 20px; }
            .summary { margin-bottom: 30px; }
            .summary-item { margin: 10px 0; }
            .income { color: green; }
            .expense { color: red; }
            .category-list { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportData.title}</h1>
            <p>Data: ${reportData.date}</p>
            <p>${reportData.groupInfo}</p>
            <p>Filtro: ${reportData.memberFilter}</p>
          </div>
          
          <div class="summary">
            <h2>Resumo</h2>
            <p class="summary-item">Receitas Totais: <span class="income">${formatCurrency(reportData.totalIncome)}</span></p>
            <p class="summary-item">Despesas Totais: <span class="expense">${formatCurrency(reportData.totalExpenses)}</span></p>
            <p class="summary-item">Saldo: <span class="${reportData.balance >= 0 ? 'income' : 'expense'}">${formatCurrency(reportData.balance)}</span></p>
          </div>
          
          <div class="category-list">
            <h2>Despesas por Categoria</h2>
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Percentual</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.categorySummary.map(cat => `
                  <tr>
                    <td>${cat.category}</td>
                    <td>${formatCurrency(cat.amount)}</td>
                    <td>${cat.percentage.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="monthly-summary">
            <h2>Evolução Mensal</h2>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.monthlySummary.map(month => `
                  <tr>
                    <td>${formatMonth(month.month)}</td>
                    <td>${formatCurrency(month.income)}</td>
                    <td>${formatCurrency(month.expenses)}</td>
                    <td>${formatCurrency(month.income - month.expenses)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;
      
      // Conversão da string HTML para Blob
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      // Criar um link para download
      downloadFile(blob, `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o relatório PDF');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Função para exportar para Excel
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const reportData = generateReportContent();
      
      // Gerar cabeçalho CSV
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Informações do relatório
      csvContent += `${reportData.title}\r\n`;
      csvContent += `Data: ${reportData.date}\r\n`;
      csvContent += `${reportData.groupInfo}\r\n`;
      csvContent += `Filtro: ${reportData.memberFilter}\r\n\r\n`;
      
      // Resumo
      csvContent += 'Resumo\r\n';
      csvContent += `Receitas Totais,${reportData.totalIncome}\r\n`;
      csvContent += `Despesas Totais,${reportData.totalExpenses}\r\n`;
      csvContent += `Saldo,${reportData.balance}\r\n\r\n`;
      
      // Despesas por categoria
      csvContent += 'Despesas por Categoria\r\n';
      csvContent += 'Categoria,Valor,Percentual\r\n';
      
      reportData.categorySummary.forEach(cat => {
        csvContent += `${cat.category},${cat.amount},${cat.percentage.toFixed(1)}%\r\n`;
      });
      
      csvContent += '\r\nEvolução Mensal\r\n';
      csvContent += 'Mês,Receitas,Despesas,Saldo\r\n';
      
      reportData.monthlySummary.forEach(month => {
        const saldo = month.income - month.expenses;
        csvContent += `${month.month},${month.income},${month.expenses},${saldo}\r\n`;
      });
      
      // Criar um URI com o conteúdo CSV
      const encodedUri = encodeURI(csvContent);
      
      // Criar um elemento para download
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Iniciar download
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      
      toast.success('Relatório Excel gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast.error('Erro ao gerar o relatório Excel');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Função para exportar para OFX (Open Financial Exchange)
  const exportToOFX = () => {
    setIsExporting(true);
    try {
      const reportData = generateReportContent();
      const now = new Date();
      const nowStr = now.toISOString().replace(/[-:]/g, '').split('.')[0];
      const startDate = reportData.monthlySummary.length > 0 
        ? reportData.monthlySummary[0].month + '-01' 
        : now.toISOString().split('T')[0];
      
      // Cabeçalho OFX
      let ofxContent = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <DTSERVER>${nowStr}</DTSERVER>
      <LANGUAGE>POR</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>${Math.floor(Math.random() * 10000)}</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>BRL</CURDEF>
        <BANKACCTFROM>
          <BANKID>999</BANKID>
          <ACCTID>999999</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${startDate.replace(/-/g, '')}</DTSTART>
          <DTEND>${nowStr.substring(0, 8)}</DTEND>
`;
      
      // Adicionar categorias como transações
      reportData.categorySummary.forEach((cat, index) => {
        const txDate = now.toISOString().split('T')[0].replace(/-/g, '');
        const txId = `CAT${index}${now.getTime()}`;
        
        ofxContent += `
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>${txDate}</DTPOSTED>
            <TRNAMT>-${cat.amount.toFixed(2)}</TRNAMT>
            <FITID>${txId}</FITID>
            <NAME>${cat.category}</NAME>
            <MEMO>Despesa por categoria</MEMO>
          </STMTTRN>`;
      });
      
      // Fechar tags
      ofxContent += `
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>${reportData.balance.toFixed(2)}</BALAMT>
          <DTASOF>${nowStr}</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
      
      // Criar um blob com o conteúdo OFX
      const blob = new Blob([ofxContent], { type: 'application/x-ofx' });
      
      // Criar um link para download
      downloadFile(blob, `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.ofx`);
      
      toast.success('Relatório OFX gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar OFX:', error);
      toast.error('Erro ao gerar o relatório OFX');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Função auxiliar para download de arquivos
  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Manipulador para exportar relatórios
  const handleExport = (format: 'pdf' | 'excel' | 'ofx') => {
    if (isExporting) return;
    
    switch (format) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'ofx':
        exportToOFX();
        break;
    }
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
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Exportar</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
                <FilePdf className="mr-2 h-4 w-4" />
                <span>Exportar como PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isExporting}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Exportar como Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('ofx')} disabled={isExporting}>
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
