/**
 * Dashboard page test suite
 * Tests the main dashboard page rendering and data display
 */

import { describe, it, expect, vi } from 'vitest'; // testing framework
import { render, screen } from '@testing-library/react'; // component testing utilities
import Dashboard from '../Dashboard'; // dashboard page component
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // data fetching context
import { BrowserRouter } from 'react-router-dom'; // routing context
import React from 'react';

// mock the main data hook with sample financial data
vi.mock('@/hooks/useBudgetData', () => ({
  useBudgetData: () => ({
    transactions: [
      {
        id: '1',
        type: 'income', // income transaction
        amount: 3000, // salary amount
        category: 'Salary',
        description: 'Monthly salary',
        date: '2024-01-15',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        type: 'expense', // expense transaction
        amount: 500, // grocery spending
        category: 'Food & Dining',
        description: 'Groceries',
        date: '2024-01-16',
        createdAt: '2024-01-16T10:00:00Z'
      }
    ],
    budgets: [
      {
        id: '1',
        category: 'Food & Dining', // budget category
        limit: 800, // budget limit
        spent: 500, // amount spent
        period: 'monthly', // budget period
        createdAt: '2024-01-01T10:00:00Z'
      }
    ],
    categories: [
      {
        id: '1',
        name: 'Salary', // category name
        color: '#10b981', // green color for income
        icon: 'Briefcase', // work-related icon
        type: 'income' // income category type
      }
    ],
    totalIncome: 3000, // calculated total income
    totalExpenses: 500, // calculated total expenses
    balance: 2500 // calculated balance (income - expenses)
  })
}));

// helper function to create test wrapper with all required providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // disable retries for faster tests
  });
  
  // wrapper that provides all necessary context for dashboard component
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}> {/* provides data fetching context */}
      <BrowserRouter> {/* provides routing context for navigation */}
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Page', () => {
  it('renders dashboard title and description', () => {
    const Wrapper = createWrapper(); // get wrapper with all providers
    render(<Dashboard />, { wrapper: Wrapper }); // render dashboard with context
    
    // verify page header content is displayed
    expect(screen.getByText('Dashboard')).toBeInTheDocument(); // page title
    expect(screen.getByText('Overview of your financial activity')).toBeInTheDocument(); // page description
  });

  it('renders all stat cards', () => {
    const Wrapper = createWrapper(); // get wrapper with all providers
    render(<Dashboard />, { wrapper: Wrapper }); // render dashboard component
    
    // verify all financial stat cards are rendered
    expect(screen.getByText('Total Balance')).toBeInTheDocument(); // balance card
    expect(screen.getByText('Total Income')).toBeInTheDocument(); // income card
    expect(screen.getByText('Total Expenses')).toBeInTheDocument(); // expenses card
    expect(screen.getByText('Active Budgets')).toBeInTheDocument(); // budget count card
  });

  it('displays correct financial values', () => {
    const Wrapper = createWrapper(); // get wrapper with all providers
    render(<Dashboard />, { wrapper: Wrapper }); // render dashboard component
    
    // verify calculated financial values are displayed correctly
    expect(screen.getByText('$2,500.00')).toBeInTheDocument(); // balance (3000 - 500)
    expect(screen.getByText('$3,000.00')).toBeInTheDocument(); // total income
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // total expenses
  });

  it('shows budget count', () => {
    const Wrapper = createWrapper(); // get wrapper with all providers
    render(<Dashboard />, { wrapper: Wrapper }); // render dashboard component
    
    // verify active budget count is displayed
    expect(screen.getByText('1')).toBeInTheDocument(); // one active budget from mock data
  });
});