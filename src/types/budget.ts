/**
 * Budget app type definitions
 * Core data models for financial tracking
 */

// single financial transaction
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string
  createdAt: string;
}

// spending budget for a category
export interface Budget {
  id: string;
  category: string;
  limit: number; // spending limit
  spent: number; // current spent amount
  period: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
}

// transaction category with styling
export interface Category {
  id: string;
  name: string;
  color: string; // hex or hsl color
  icon: string; // lucide icon name
  type: 'income' | 'expense';
  isDefault?: boolean;
  createdAt?: string;
}

// savings goal
export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date string
  description: string;
  createdAt: string;
}

// recurring income/expense
export interface RecurringTransaction {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  frequencyValue: number; // eg. every 2 weeks = 2
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  isActive: boolean;
  createdAt: string;
}

// default expense categories for new users
export const defaultExpenseCategories: Category[] = [
  { id: '1', name: 'Food & Dining', color: 'hsl(var(--chart-1))', icon: 'UtensilsCrossed', type: 'expense' },
  { id: '2', name: 'Transportation', color: 'hsl(var(--chart-2))', icon: 'Car', type: 'expense' },
  { id: '3', name: 'Shopping', color: 'hsl(var(--chart-3))', icon: 'ShoppingBag', type: 'expense' },
  { id: '4', name: 'Entertainment', color: 'hsl(var(--chart-4))', icon: 'Film', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', color: 'hsl(var(--chart-5))', icon: 'Receipt', type: 'expense' },
  { id: '6', name: 'Healthcare', color: 'hsl(var(--chart-6))', icon: 'Heart', type: 'expense' },
];

// default income categories 
export const defaultIncomeCategories: Category[] = [
  { id: '7', name: 'Salary', color: 'hsl(var(--income))', icon: 'Briefcase', type: 'income' },
  { id: '8', name: 'Freelance', color: 'hsl(var(--savings))', icon: 'Laptop', type: 'income' },
  { id: '9', name: 'Investment', color: 'hsl(var(--investment))', icon: 'TrendingUp', type: 'income' },
  { id: '10', name: 'Other Income', color: 'hsl(var(--primary))', icon: 'DollarSign', type: 'income' },
];