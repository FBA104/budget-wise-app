/**
 * Dashboard - main financial overview page
 * Shows stats, recent transactions, and budget progress
 */

import React from 'react';
import { useBudgetData } from '@/hooks/useBudgetData';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { RecentTransactions } from '@/components/RecentTransactions';
import { BudgetOverview } from '@/components/BudgetOverview';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Dashboard() {
  const { transactions, budgets, categories, totalIncome, totalExpenses, balance } = useBudgetData();
  const navigate = useNavigate();

  // format as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // month-over-month calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% from last month`;
  };

  const incomeChange = calculateChange(currentMonthIncome, lastMonthIncome);
  const expenseChange = calculateChange(currentMonthExpenses, lastMonthExpenses);
  const currentBalance = currentMonthIncome - currentMonthExpenses;
  const lastBalance = lastMonthIncome - lastMonthExpenses;
  const balanceChange = calculateChange(currentBalance, lastBalance);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={formatCurrency(balance)}
          change={balanceChange}
          changeType={balance >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          gradient="bg-gradient-primary"
        />
        
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          change={incomeChange}
          changeType="positive"
          icon={TrendingUp}
          gradient="bg-gradient-success"
        />
        
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          change={expenseChange}
          changeType="negative"
          icon={TrendingDown}
          gradient="bg-destructive"
        />
        
        <StatCard
          title="Active Budgets"
          value={budgets.length.toString()}
          change={`${budgets.filter(b => (b.spent / b.limit) < 0.8).length} on track`}
          changeType="positive"
          icon={DollarSign}
          gradient="bg-warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions 
          transactions={transactions}
          categories={categories}
          onViewAll={() => navigate('/transactions')}
        />
        
        <BudgetOverview budgets={budgets} />
      </div>
    </div>
  );
}