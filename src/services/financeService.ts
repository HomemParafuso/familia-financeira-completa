import { 
  Transaction, 
  Category, 
  Budget, 
  FinancialSummary, 
  FinancialForecast
} from '@/types/finance';
import { mockCategories } from '@/mockData';
import { 
  initializeTransactions 
} from './transactionService';
import { 
  initializeCategories 
} from './categoryService';
import { 
  initializeBudgets 
} from './budgetService';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  format,
  addMonths,
  isBefore,
  isAfter
} from 'date-fns';

// Initial data load
export const loadInitialFinanceData = async () => {
  const transactions = initializeTransactions();
  
  // Verificar se há categorias no localStorage
  let categories = initializeCategories();
  
  // Se não houver categorias no localStorage, usar as categorias padrão
  if (categories.length === 0) {
    categories = mockCategories;
    // Salvar categorias padrão no localStorage
    localStorage.setItem('finance_categories', JSON.stringify(categories));
  }
  
  const budgets = initializeBudgets();
  
  return {
    transactions,
    categories,
    budgets
  };
};

// Calculate financial summary
export const calculateFinancialSummary = (transactions: Transaction[], categories: Category[]): FinancialSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Group by month for monthly summary (simplified)
  const monthsData = new Map<string, {income: number, expenses: number}>();
  
  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
    if (!monthsData.has(month)) {
      monthsData.set(month, { income: 0, expenses: 0 });
    }
    
    const data = monthsData.get(month)!;
    if (t.type === 'income') {
      data.income += t.amount;
    } else {
      data.expenses += t.amount;
    }
  });
  
  const monthlySummary = Array.from(monthsData.entries()).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    balance: data.income - data.expenses
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate category summary for expenses
  const categoryData = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
      categoryData.set(
        categoryName, 
        (categoryData.get(categoryName) || 0) + t.amount
      );
    });
  
  const categorySummary = Array.from(categoryData.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    monthlySummary,
    categorySummary
  };
};

// Calcular previsões financeiras
export const calculateFinancialForecast = (transactions: Transaction[], categories: Category[]): FinancialForecast => {
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const daysInMonth = currentMonthEnd.getDate();
  const currentDayOfMonth = now.getDate();
  const remainingDaysInMonth = daysInMonth - currentDayOfMonth;
  
  // Transações do mês atual
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );
  
  // Cálculos para o mês atual
  const currentMonthIncomeToDate = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentMonthExpensesToDate = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Média diária do mês atual
  const avgDailyIncomeCurrentMonth = currentMonthIncomeToDate / currentDayOfMonth;
  const avgDailyExpenseCurrentMonth = currentMonthExpensesToDate / currentDayOfMonth;
  
  // Previsão para o restante do mês atual
  const projectedRemainingIncome = avgDailyIncomeCurrentMonth * remainingDaysInMonth;
  const projectedRemainingExpenses = avgDailyExpenseCurrentMonth * remainingDaysInMonth;
  
  // Previsão total para o mês atual
  const projectedMonthIncome = currentMonthIncomeToDate + projectedRemainingIncome;
  const projectedMonthExpenses = currentMonthExpensesToDate + projectedRemainingExpenses;
  const projectedMonthBalance = projectedMonthIncome - projectedMonthExpenses;
  
  // Coletar os últimos 6 meses de dados (incluindo o atual)
  const last6Months = [];
  for (let i = 0; i < 6; i++) {
    const date = subMonths(now, i);
    const monthStr = format(date, 'yyyy-MM');
    
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(monthStr)
    );
    
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    last6Months.push({
      month: monthStr,
      income: monthIncome,
      expenses: monthExpenses,
      balance: monthIncome - monthExpenses
    });
  }
  
  // Reordenar do mais antigo para o mais recente
  last6Months.reverse();
  
  // Calcular médias dos últimos 6 meses (excluindo o mês atual)
  const historicalMonths = last6Months.slice(0, 5);
  const avgMonthlyIncome = historicalMonths.reduce((sum, m) => sum + m.income, 0) / historicalMonths.length;
  const avgMonthlyExpenses = historicalMonths.reduce((sum, m) => sum + m.expenses, 0) / historicalMonths.length;
  const avgMonthlyBalance = avgMonthlyIncome - avgMonthlyExpenses;
  
  // Projeção para os próximos 6 meses
  const next6Months = [];
  for (let i = 0; i < 6; i++) {
    const date = addMonths(now, i);
    const monthStr = format(date, 'yyyy-MM');
    
    // Para o mês atual, usamos a projeção baseada nos dias já decorridos
    if (i === 0) {
      next6Months.push({
        month: monthStr,
        income: projectedMonthIncome,
        expenses: projectedMonthExpenses,
        balance: projectedMonthBalance,
        isProjected: true
      });
    } else {
      // Para meses futuros, usamos a média histórica
      next6Months.push({
        month: monthStr,
        income: avgMonthlyIncome,
        expenses: avgMonthlyExpenses,
        balance: avgMonthlyBalance,
        isProjected: true
      });
    }
  }
  
  // Projeção para o ano inteiro
  const currentYear = now.getFullYear();
  const monthsLeftInYear = 12 - parseInt(format(now, 'MM'));
  
  // Já realizados + projeção para o restante do ano
  const yearToDateIncome = transactions
    .filter(t => t.date.startsWith(currentYear.toString()) && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const yearToDateExpenses = transactions
    .filter(t => t.date.startsWith(currentYear.toString()) && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const projectedYearIncome = yearToDateIncome + avgMonthlyIncome * monthsLeftInYear;
  const projectedYearExpenses = yearToDateExpenses + avgMonthlyExpenses * monthsLeftInYear;
  const projectedYearBalance = projectedYearIncome - projectedYearExpenses;
  
  // Calcular tendências por categoria
  const categoriesTrend = new Map<string, {current: number, projected: number, trend: number}>();
  
  // Obter gastos médios mensais por categoria nos últimos meses
  categories.forEach(category => {
    // Gastos atuais no mês corrente
    const currentMonthCategoryExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Média histórica mensal para esta categoria
    const historicalCategoryExpenses = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.categoryId === category.id &&
        !t.date.startsWith(currentMonth)
      );
    
    // Agrupar por mês para obter a média correta
    const monthlyExpenses = new Map<string, number>();
    historicalCategoryExpenses.forEach(t => {
      const month = t.date.substring(0, 7);
      monthlyExpenses.set(month, (monthlyExpenses.get(month) || 0) + t.amount);
    });
    
    const avgCategoryExpense = monthlyExpenses.size > 0 
      ? Array.from(monthlyExpenses.values()).reduce((sum, val) => sum + val, 0) / monthlyExpenses.size 
      : 0;
    
    // Projeção para o mês atual
    const projectedCategoryExpense = currentDayOfMonth < daysInMonth
      ? currentMonthCategoryExpenses * (daysInMonth / currentDayOfMonth)
      : currentMonthCategoryExpenses;
    
    // Calcular tendência (variação percentual)
    const trend = avgCategoryExpense > 0 
      ? ((projectedCategoryExpense - avgCategoryExpense) / avgCategoryExpense) * 100 
      : 0;
    
    categoriesTrend.set(category.name, {
      current: currentMonthCategoryExpenses,
      projected: projectedCategoryExpense,
      trend
    });
  });
  
  return {
    currentMonth: {
      month: currentMonth,
      daysElapsed: currentDayOfMonth,
      totalDays: daysInMonth,
      incomeToDate: currentMonthIncomeToDate,
      expensesToDate: currentMonthExpensesToDate,
      projectedIncome: projectedMonthIncome,
      projectedExpenses: projectedMonthExpenses,
      projectedBalance: projectedMonthBalance,
      completionPercentage: (currentDayOfMonth / daysInMonth) * 100
    },
    historicalData: last6Months,
    projectedMonths: next6Months,
    yearProjection: {
      year: currentYear,
      incomeToDate: yearToDateIncome,
      expensesToDate: yearToDateExpenses,
      projectedIncome: projectedYearIncome,
      projectedExpenses: projectedYearExpenses,
      projectedBalance: projectedYearBalance
    },
    categoriesTrend: Array.from(categoriesTrend.entries()).map(([category, data]) => ({
      category,
      currentAmount: data.current,
      projectedAmount: data.projected,
      trend: data.trend
    })).sort((a, b) => b.projectedAmount - a.projectedAmount)
  };
};
