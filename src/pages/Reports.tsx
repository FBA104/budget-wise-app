/**
 * Reports - financial charts and analytics
 */

import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';
import { format, subDays, subMonths, parseISO } from 'date-fns';

export default function Reports() {
  const { transactions, budgets, categories, totalIncome, totalExpenses, balance } = useBudgetData();
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('category');

  // filter transactions by selected time range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    // calculate start date based on selected range
    switch (timeRange) {
      case '7d': startDate = subDays(now, 7); break; // last week
      case '30d': startDate = subDays(now, 30); break; // last month  
      case '3m': startDate = subMonths(now, 3); break; // last 3 months
      case '6m': startDate = subMonths(now, 6); break; // last 6 months
      case '1y': startDate = subMonths(now, 12); break; // last year
      default: startDate = subDays(now, 30); // default to 30 days
    }
    
    // only include transactions after start date
    return transactions.filter(t => parseISO(t.date) >= startDate);
  }, [transactions, timeRange]);

  // group expenses by category for pie chart
  const categoryData = useMemo(() => {
    // sum up expenses by category
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense') // only expenses
      .reduce((acc, transaction) => {
        // add to existing category total or start new one
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    // convert to chart format with colors
    return Object.entries(expensesByCategory).map(([category, amount]) => {
      const categoryInfo = categories.find(c => c.name === category);
      return {
        name: category,
        value: amount,
        color: categoryInfo?.color || '#8884d8', // use category color or default
      };
    }).sort((a, b) => b.value - a.value); // sort by amount (highest first)
  }, [filteredTransactions, categories]);

  // create income vs expenses timeline for line chart
  const timeSeriesData = useMemo(() => {
    // group transactions by date
    const groupedData = filteredTransactions.reduce((acc, transaction) => {
      const date = format(parseISO(transaction.date), 'MMM dd'); // format as "Jan 15"
      
      // create date entry if it doesn't exist
      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0 };
      }
      
      // add to appropriate bucket
      if (transaction.type === 'income') {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expenses += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { date: string; income: number; expenses: number }>);

    // convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredTransactions]);

  // Budget vs Actual spending
  const budgetComparisonData = useMemo(() => {
    return budgets.map(budget => ({
      category: budget.category,
      budgeted: budget.limit,
      spent: budget.spent,
      remaining: Math.max(0, budget.limit - budget.spent),
    }));
  }, [budgets]);

  // Summary statistics
  const periodIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const periodExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodBalance = periodIncome - periodExpenses;
  const avgDailyExpense = periodExpenses / Math.max(1, filteredTransactions.length);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) { // only show if hovering over chart
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p> {/* chart label (usually date) */}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}> {/* match chart color */}
              {entry.dataKey}: {formatCurrency(entry.value)} {/* format as currency */}
            </p>
          ))}
        </div>
      );
    }
    return null; // hide tooltip when not hovering
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Visualize your financial data and track trends
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* time range selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem> {/* 1 week */}
              <SelectItem value="30d">Last 30 days</SelectItem> {/* 1 month */}
              <SelectItem value="3m">Last 3 months</SelectItem> {/* quarter */}
              <SelectItem value="6m">Last 6 months</SelectItem> {/* half year */}
              <SelectItem value="1y">Last year</SelectItem> {/* full year */}
            </SelectContent>
          </Select>
          
          {/* export button (placeholder) */}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="font-medium">Period Income</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(periodIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {timeRange.replace('d', ' days').replace('m', ' months').replace('y', ' year')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-destructive" />
              <span className="font-medium">Period Expenses</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(periodExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(avgDailyExpense)}/day
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">Period Balance</span>
            </div>
            <p className={`text-2xl font-bold ${periodBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(periodBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {periodBalance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <PieChartIcon className="w-5 h-5 text-warning" />
              <span className="font-medium">Transactions</span>
            </div>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === 'expense').length} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5" />
              <span>Spending by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No expense data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expenses Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Income vs Expenses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No transaction data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Budget vs Actual</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3b82f6" />
                  <Bar dataKey="spent" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No budget data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Spending Categories */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Top Spending Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData.slice(0, 6)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No category data for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}