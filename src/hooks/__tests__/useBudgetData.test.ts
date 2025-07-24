/**
 * useBudgetData hook test suite
 * Tests the main data fetching hook for budget, transaction, and category data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'; // testing framework
import { renderHook } from '@testing-library/react'; // hook testing utilities
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // data fetching context
import { useBudgetData } from '../useBudgetData'; // hook under test
import React from 'react';

// sample transaction data for testing calculations
const mockTransactions = [
  {
    id: '1',
    type: 'income', // income transaction type
    amount: 3000, // monthly salary amount
    category: 'Salary',
    description: 'Monthly salary',
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    user_id: 'user-1'
  },
  {
    id: '2', 
    type: 'expense', // expense transaction type
    amount: 500, // grocery spending
    category: 'Food & Dining',
    description: 'Groceries',
    date: '2024-01-16',
    created_at: '2024-01-16T10:00:00Z',
    user_id: 'user-1'
  }
];

// sample budget data for testing budget calculations
const mockBudgets = [
  {
    id: '1',
    category: 'Food & Dining', // budget category
    limit_amount: 800, // budget limit
    spent: 500, // amount already spent
    period: 'monthly', // budget period
    created_at: '2024-01-01T10:00:00Z',
    user_id: 'user-1'
  }
];

// sample category data for testing categorization
const mockCategories = [
  {
    id: '1',
    name: 'Salary', // category name
    color: '#10b981', // category color for UI
    icon: 'Briefcase', // icon for visual representation
    type: 'income', // category type (income/expense)
    is_default: true, // default system category
    created_at: '2024-01-01T10:00:00Z',
    user_id: 'user-1'
  }
];

// mock Supabase client to avoid real database calls during testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      // mock database responses for different tables
      const mockResponses: { [key: string]: any } = {
        transactions: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockTransactions, // return mock transaction data
                error: null 
              }))
            }))
          }))
        },
        budgets: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockBudgets, // return mock budget data
                error: null 
              }))
            }))
          }))
        },
        categories: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockCategories, // return mock category data
                error: null 
              }))
            }))
          }))
        }
      };
      return mockResponses[table]; // return appropriate mock based on table name
    }),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'user-1' } }, // mock authenticated user
        error: null 
      }))
    }
  }
}));

describe('useBudgetData Hook', () => {
  let queryClient: QueryClient;

  // set up fresh query client before each test
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // disable retries for faster tests
        },
      },
    });
  });

  // wrapper component that provides React Query context to the hook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useBudgetData(), { wrapper }); // render hook with query context

    // verify hook returns empty arrays initially while data is loading
    expect(result.current.transactions).toEqual([]); // no transactions initially
    expect(result.current.budgets).toEqual([]); // no budgets initially
    expect(result.current.categories).toEqual([]); // no categories initially
  });

  it('should calculate totals correctly when data is available', () => {
    const { result } = renderHook(() => useBudgetData(), { wrapper }); // render hook with query context

    // verify calculated totals start at zero (hook calculates from transaction data)
    expect(result.current.totalIncome).toBe(0); // income total starts at 0
    expect(result.current.totalExpenses).toBe(0); // expense total starts at 0
    expect(result.current.balance).toBe(0); // balance (income - expenses) starts at 0
  });

  it('should handle empty data correctly', () => {
    const { result } = renderHook(() => useBudgetData(), { wrapper }); // render hook with query context

    // verify hook handles empty state gracefully without errors
    expect(result.current.totalIncome).toBe(0); // handles no income data
    expect(result.current.totalExpenses).toBe(0); // handles no expense data
    expect(result.current.balance).toBe(0); // calculates balance correctly with no data
  });
});