/**
 * Budgets page test suite
 * Tests budget management functionality including CRUD operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Budgets from '../Budgets';
import React from 'react';

// Mock the budget data hook
const mockBudgetData = {
  budgets: [],
  addBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  categories: [
    {
      id: '1',
      name: 'Food & Dining',
      color: '#10b981',
      icon: 'UtensilsCrossed',
      type: 'expense'
    },
    {
      id: '2',
      name: 'Transportation',
      color: '#3b82f6',
      icon: 'Car',
      type: 'expense'
    }
  ]
};

vi.mock('@/hooks/useBudgetData', () => ({
  useBudgetData: () => mockBudgetData
}));

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock child components
vi.mock('@/components/budgets/BudgetForm', () => ({
  BudgetForm: ({ formData, setFormData, onSubmit, onCancel, isEditing }: any) => (
    <div data-testid="budget-form">
      <form onSubmit={onSubmit}>
        <input
          data-testid="category-input"
          value={formData.category}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
          placeholder="Category"
        />
        <input
          data-testid="limit-input"
          value={formData.limit}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, limit: e.target.value }))}
          placeholder="Limit"
        />
        <select
          data-testid="period-select"
          value={formData.period}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, period: e.target.value }))}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button type="submit">{isEditing ? 'Update Budget' : 'Create Budget'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  )
}));

vi.mock('@/components/budgets/BudgetCard', () => ({
  BudgetCard: ({ budget, onEdit, onDelete }: any) => (
    <div data-testid={`budget-card-${budget.id}`}>
      <span>{budget.category} - ${budget.limit}</span>
      <button onClick={() => onEdit(budget)}>Edit</button>
      <button onClick={() => onDelete(budget.id)}>Delete</button>
    </div>
  )
}));

vi.mock('@/components/budgets/BudgetStats', () => ({
  BudgetStats: ({ budgets }: any) => (
    <div data-testid="budget-stats">
      Budget Stats: {budgets.length} budgets
    </div>
  )
}));

// Mock global confirm
global.confirm = vi.fn();

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Budgets Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBudgetData.budgets = [];
  });

  it('should render page header and add budget button', () => {
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    expect(screen.getByText('Budgets')).toBeInTheDocument();
    expect(screen.getByText('Set spending limits and track your progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add budget/i })).toBeInTheDocument();
  });

  it('should render empty state when no budgets exist', () => {
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    expect(screen.getByText('No budgets created yet')).toBeInTheDocument();
    expect(screen.getByText('Start by creating your first budget to track spending')).toBeInTheDocument();
  });

  it('should render budget list when budgets exist', () => {
    mockBudgetData.budgets = [
      {
        id: '1',
        category: 'Food & Dining',
        limit: 500,
        spent: 200,
        period: 'monthly',
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        category: 'Transportation',
        limit: 300,
        spent: 150,
        period: 'monthly',
        createdAt: '2024-01-01'
      }
    ];

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    expect(screen.getByText('Your Budgets (2)')).toBeInTheDocument();
    expect(screen.getByTestId('budget-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('budget-card-2')).toBeInTheDocument();
    expect(screen.queryByText('No budgets created yet')).not.toBeInTheDocument();
  });

  it('should open add budget dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /add budget/i }));

    expect(screen.getByText('Create New Budget')).toBeInTheDocument();
    expect(screen.getByTestId('budget-form')).toBeInTheDocument();
  });

  it('should handle form submission for creating budget', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    // Fill form
    await user.type(screen.getByTestId('category-input'), 'Food & Dining');
    await user.type(screen.getByTestId('limit-input'), '500');

    // Submit form
    await user.click(screen.getByText('Create Budget'));

    expect(mockBudgetData.addBudget).toHaveBeenCalledWith({
      category: 'Food & Dining',
      limit: 500,
      period: 'monthly'
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Budget created successfully!'
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    // Submit empty form
    await user.click(screen.getByText('Create Budget'));

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Please fill in all required fields.',
      variant: 'destructive'
    });

    expect(mockBudgetData.addBudget).not.toHaveBeenCalled();
  });

  it('should prevent duplicate budgets for same category', async () => {
    const user = userEvent.setup();
    
    mockBudgetData.budgets = [
      {
        id: '1',
        category: 'Food & Dining',
        limit: 500,
        spent: 200,
        period: 'monthly',
        createdAt: '2024-01-01'
      }
    ];

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    // Try to create duplicate
    await user.type(screen.getByTestId('category-input'), 'Food & Dining');
    await user.type(screen.getByTestId('limit-input'), '600');
    await user.click(screen.getByText('Create Budget'));

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'A budget already exists for this category.',
      variant: 'destructive'
    });

    expect(mockBudgetData.addBudget).not.toHaveBeenCalled();
  });

  it('should handle editing budget', async () => {
    const user = userEvent.setup();
    
    const mockBudget = {
      id: '1',
      category: 'Food & Dining',
      limit: 500,
      spent: 200,
      period: 'monthly',
      createdAt: '2024-01-01'
    };

    mockBudgetData.budgets = [mockBudget];

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Click edit button
    await user.click(screen.getByText('Edit'));

    // Should open edit dialog
    expect(screen.getByText('Edit Budget')).toBeInTheDocument();
    expect(screen.getByText('Update Budget')).toBeInTheDocument();

    // Form should be pre-filled
    expect(screen.getByTestId('category-input')).toHaveValue('Food & Dining');
    expect(screen.getByTestId('limit-input')).toHaveValue('500');
  });

  it('should handle budget update submission', async () => {
    const user = userEvent.setup();
    
    const mockBudget = {
      id: '1',
      category: 'Food & Dining',
      limit: 500,
      spent: 200,
      period: 'monthly',
      createdAt: '2024-01-01'
    };

    mockBudgetData.budgets = [mockBudget];

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Click edit button
    await user.click(screen.getByText('Edit'));

    // Update limit
    await user.clear(screen.getByTestId('limit-input'));
    await user.type(screen.getByTestId('limit-input'), '600');

    // Submit update
    await user.click(screen.getByText('Update Budget'));

    expect(mockBudgetData.updateBudget).toHaveBeenCalledWith('1', {
      category: 'Food & Dining',
      limit: 600,
      period: 'monthly'
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Budget updated successfully!'
    });
  });

  it('should handle budget deletion with confirmation', async () => {
    const user = userEvent.setup();
    
    const mockBudget = {
      id: '1',
      category: 'Food & Dining',
      limit: 500,
      spent: 200,
      period: 'monthly',
      createdAt: '2024-01-01'
    };

    mockBudgetData.budgets = [mockBudget];
    global.confirm = vi.fn().mockReturnValue(true);

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Click delete button
    await user.click(screen.getByText('Delete'));

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this budget?');
    expect(mockBudgetData.deleteBudget).toHaveBeenCalledWith('1');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Budget deleted successfully!'
    });
  });

  it('should not delete budget when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    
    const mockBudget = {
      id: '1',
      category: 'Food & Dining',
      limit: 500,
      spent: 200,
      period: 'monthly',
      createdAt: '2024-01-01'
    };

    mockBudgetData.budgets = [mockBudget];
    global.confirm = vi.fn().mockReturnValue(false);

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Click delete button
    await user.click(screen.getByText('Delete'));

    expect(global.confirm).toHaveBeenCalled();
    expect(mockBudgetData.deleteBudget).not.toHaveBeenCalled();
  });

  it('should close add dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));
    expect(screen.getByText('Create New Budget')).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByText('Cancel'));

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Create New Budget')).not.toBeInTheDocument();
    });
  });

  it('should close edit dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    const mockBudget = {
      id: '1',
      category: 'Food & Dining',
      limit: 500,
      spent: 200,
      period: 'monthly',
      createdAt: '2024-01-01'
    };

    mockBudgetData.budgets = [mockBudget];

    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open edit dialog
    await user.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Budget')).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByText('Cancel'));

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Edit Budget')).not.toBeInTheDocument();
    });
  });

  it('should render budget stats component', () => {
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    expect(screen.getByTestId('budget-stats')).toBeInTheDocument();
  });

  it('should handle different budget periods', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    // Fill form with weekly period
    await user.type(screen.getByTestId('category-input'), 'Transportation');
    await user.type(screen.getByTestId('limit-input'), '100');
    await user.selectOptions(screen.getByTestId('period-select'), 'weekly');

    // Submit form
    await user.click(screen.getByText('Create Budget'));

    expect(mockBudgetData.addBudget).toHaveBeenCalledWith({
      category: 'Transportation',
      limit: 100,
      period: 'weekly'
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    // Fill form
    await user.type(screen.getByTestId('category-input'), 'Food & Dining');
    await user.type(screen.getByTestId('limit-input'), '500');

    // Submit form
    await user.click(screen.getByText('Create Budget'));

    // Open dialog again to check if form is reset
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    expect(screen.getByTestId('category-input')).toHaveValue('');
    expect(screen.getByTestId('limit-input')).toHaveValue('');
    expect(screen.getByTestId('period-select')).toHaveValue('monthly');
  });

  it('should handle decimal budget limits', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Budgets />
      </TestWrapper>
    );

    // Open add dialog
    await user.click(screen.getByRole('button', { name: /add budget/i }));

    // Fill form with decimal amount
    await user.type(screen.getByTestId('category-input'), 'Food & Dining');
    await user.type(screen.getByTestId('limit-input'), '250.50');

    // Submit form
    await user.click(screen.getByText('Create Budget'));

    expect(mockBudgetData.addBudget).toHaveBeenCalledWith({
      category: 'Food & Dining',
      limit: 250.50,
      period: 'monthly'
    });
  });
});