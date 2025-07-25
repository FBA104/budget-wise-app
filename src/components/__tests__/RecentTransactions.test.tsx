/**
 * RecentTransactions component test suite
 * Tests recent transactions display and interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentTransactions } from '../RecentTransactions';
import { Transaction, Category } from '@/types/budget';

// Mock date-fns to control relative time display
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date, options) => '2 days ago')
}));

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 'trans-1',
    type: 'expense',
    amount: 25.50,
    category: 'Food & Dining',
    description: 'Coffee and pastry',
    date: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'trans-2',
    type: 'income',
    amount: 3000,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2024-01-14T10:00:00Z',
    createdAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 'trans-3',
    type: 'expense',
    amount: 50,
    category: 'Transportation',
    description: 'Gas for car',
    date: '2024-01-13T10:00:00Z',
    createdAt: '2024-01-13T10:00:00Z'
  },
  {
    id: 'trans-4',
    type: 'expense',
    amount: 120,
    category: 'Shopping',
    description: 'Groceries',
    date: '2024-01-12T10:00:00Z',
    createdAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'trans-5',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    description: 'Website project',
    date: '2024-01-11T10:00:00Z',
    createdAt: '2024-01-11T10:00:00Z'
  },
  {
    id: 'trans-6',
    type: 'expense',
    amount: 80,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: '2024-01-10T10:00:00Z',
    createdAt: '2024-01-10T10:00:00Z'
  }
];

// Mock category data
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Food & Dining',
    color: '#10b981',
    icon: 'UtensilsCrossed',
    type: 'expense'
  },
  {
    id: 'cat-2',
    name: 'Transportation',
    color: '#3b82f6',
    icon: 'Car',
    type: 'expense'
  },
  {
    id: 'cat-3',
    name: 'Shopping',
    color: '#f59e0b',
    icon: 'ShoppingBag',
    type: 'expense'
  },
  {
    id: 'cat-4',
    name: 'Salary',
    color: '#059669',
    icon: 'Briefcase',
    type: 'income'
  },
  {
    id: 'cat-5',
    name: 'Freelance',
    color: '#7c3aed',
    icon: 'Laptop',
    type: 'income'
  }
];

const mockOnViewAll = vi.fn();

describe('RecentTransactions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render component title and view all button', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
  });

  it('should display only first 5 transactions', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    // Should show first 5 transactions
    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument();
    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    expect(screen.getByText('Gas for car')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Website project')).toBeInTheDocument();

    // Should not show 6th transaction
    expect(screen.queryByText('Movie tickets')).not.toBeInTheDocument();
  });

  it('should format expense amounts with negative sign', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions.slice(0, 1)} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('-$25.50')).toBeInTheDocument();
  });

  it('should format income amounts with positive sign', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions.slice(1, 2)} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('+$3,000.00')).toBeInTheDocument();
  });

  it('should display transaction category and relative time', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions.slice(0, 1)} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('Food & Dining • 2 days ago')).toBeInTheDocument();
  });

  it('should show empty state when no transactions', () => {
    render(
      <RecentTransactions 
        transactions={[]} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(screen.getByText('Start by adding your first transaction')).toBeInTheDocument();
  });

  it('should call onViewAll when View All button is clicked', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    const viewAllButton = screen.getByRole('button', { name: /view all/i });
    fireEvent.click(viewAllButton);

    expect(mockOnViewAll).toHaveBeenCalledTimes(1);
  });

  it('should use default icon and color for unknown category', () => {
    const unknownCategoryTransactions: Transaction[] = [
      {
        id: 'trans-unknown',
        type: 'expense',
        amount: 100,
        category: 'Unknown Category',
        description: 'Unknown expense',
        date: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    render(
      <RecentTransactions 
        transactions={unknownCategoryTransactions} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('Unknown expense')).toBeInTheDocument();
    expect(screen.getByText('Unknown Category • 2 days ago')).toBeInTheDocument();
  });

  it('should handle single transaction correctly', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions.slice(0, 1)} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument();
    expect(screen.getByText('-$25.50')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining • 2 days ago')).toBeInTheDocument();
  });

  it('should display correct income styling', () => {
    render(
      <RecentTransactions 
        transactions={[mockTransactions[1]]} // salary transaction
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    const amountElement = screen.getByText('+$3,000.00');
    expect(amountElement).toHaveClass('text-success');
  });

  it('should display correct expense styling', () => {
    render(
      <RecentTransactions 
        transactions={[mockTransactions[0]]} // expense transaction
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    const amountElement = screen.getByText('-$25.50');
    expect(amountElement).toHaveClass('text-destructive');
  });

  it('should truncate long transaction descriptions', () => {
    const longDescriptionTransaction: Transaction[] = [
      {
        id: 'trans-long',
        type: 'expense',
        amount: 50,
        category: 'Food & Dining',
        description: 'This is a very long transaction description that should be truncated in the UI',
        date: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    render(
      <RecentTransactions 
        transactions={longDescriptionTransaction} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    const descriptionElement = screen.getByText('This is a very long transaction description that should be truncated in the UI');
    expect(descriptionElement).toHaveClass('truncate');
  });

  it('should handle empty categories array', () => {
    render(
      <RecentTransactions 
        transactions={mockTransactions.slice(0, 1)} 
        categories={[]} 
        onViewAll={mockOnViewAll} 
      />
    );

    // Should still render transaction with default icon/color
    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument();
    expect(screen.getByText('-$25.50')).toBeInTheDocument();
  });

  it('should handle decimal amounts correctly', () => {
    const decimalTransaction: Transaction[] = [
      {
        id: 'trans-decimal',
        type: 'expense',
        amount: 123.45,
        category: 'Food & Dining',
        description: 'Decimal amount test',
        date: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    render(
      <RecentTransactions 
        transactions={decimalTransaction} 
        categories={mockCategories} 
        onViewAll={mockOnViewAll} 
      />
    );

    expect(screen.getByText('-$123.45')).toBeInTheDocument();
  });
});