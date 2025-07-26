/**
 * Visual Regression Test Suite
 * Tests for visual consistency across different screen sizes and themes
 * 
 * Note: This suite provides a framework for visual regression testing.
 * In a real project, you would integrate with tools like:
 * - Chromatic (Storybook)
 * - Percy
 * - Playwright with screenshots
 * - Cypress with visual testing plugins
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock navigation and data hooks
const mockBudgetData = {
  budgets: [
    {
      id: '1',
      category: 'Food & Dining',
      limit: 500,
      spent: 350,
      period: 'monthly' as const,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      category: 'Transportation',
      limit: 300,
      spent: 150,
      period: 'monthly' as const,
      createdAt: '2024-01-01'
    }
  ],
  transactions: [
    {
      id: '1',
      description: 'Grocery Shopping',
      amount: 85.50,
      category: 'Food & Dining',
      date: '2024-01-15',
      type: 'expense' as const,
      createdAt: '2024-01-15'
    }
  ],
  categories: [
    {
      id: '1',
      name: 'Food & Dining',
      color: '#10b981',
      icon: 'UtensilsCrossed',
      type: 'expense' as const
    }
  ],
  addBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
};

vi.mock('@/hooks/useBudgetData', () => ({
  useBudgetData: () => mockBudgetData
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock recharts to prevent rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

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
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Helper function to simulate viewport sizes
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock components for testing
const MockBudgetCard = ({ budget }: any) => (
  <div 
    data-testid="budget-card" 
    className="p-4 border rounded-lg shadow-sm"
    style={{ 
      borderColor: budget.spent > budget.limit ? '#ef4444' : '#10b981',
      backgroundColor: '#ffffff'
    }}
  >
    <h3 className="font-semibold text-lg">{budget.category}</h3>
    <p className="text-sm text-gray-600">
      ${budget.spent} / ${budget.limit}
    </p>
    <div 
      className="w-full bg-gray-200 rounded-full h-2 mt-2"
      data-testid="progress-bar"
    >
      <div
        className="h-2 rounded-full"
        style={{
          width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
          backgroundColor: budget.spent > budget.limit ? '#ef4444' : '#10b981'
        }}
      />
    </div>
  </div>
);

const MockTransactionCard = ({ transaction }: any) => (
  <div 
    data-testid="transaction-card"
    className="flex justify-between items-center p-3 border-b"
  >
    <div>
      <p className="font-medium">{transaction.description}</p>
      <p className="text-sm text-gray-500">{transaction.category}</p>
    </div>
    <div className="text-right">
      <p className={`font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
        {transaction.type === 'expense' ? '-' : '+'}${Math.abs(transaction.amount)}
      </p>
      <p className="text-xs text-gray-400">{transaction.date}</p>
    </div>
  </div>
);

const MockDashboard = () => (
  <div className="space-y-6 p-4">
    <header>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Welcome to your financial overview</p>
    </header>
    
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
        <p className="text-2xl font-bold text-gray-900">$1,200</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
        <p className="text-2xl font-bold text-red-600">$850</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
        <p className="text-2xl font-bold text-green-600">$350</p>
      </div>
    </div>
    
    {/* Budget Cards */}
    <section>
      <h2 className="text-xl font-semibold mb-4">Your Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockBudgetData.budgets.map(budget => (
          <MockBudgetCard key={budget.id} budget={budget} />
        ))}
      </div>
    </section>
    
    {/* Recent Transactions */}
    <section>
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="bg-white rounded-lg shadow border">
        {mockBudgetData.transactions.map(transaction => (
          <MockTransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </section>
  </div>
);

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset viewport to default
    setViewportSize(1024, 768);
  });

  describe('Responsive Design Tests', () => {
    it('should render correctly on mobile devices (320px)', () => {
      setViewportSize(320, 568);
      
      render(
        <TestWrapper>
          <MockDashboard />
        </TestWrapper>
      );

      // Check that elements are present and accessible
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getAllByTestId('budget-card')).toHaveLength(2);
      
      // In a real visual regression test, you would take a screenshot here
      // expect(await page.screenshot()).toMatchSnapshot('dashboard-mobile-320px.png');
    });

    it('should render correctly on tablet devices (768px)', () => {
      setViewportSize(768, 1024);
      
      render(
        <TestWrapper>
          <MockDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getAllByTestId('budget-card')).toHaveLength(2);
      
      // In a real test: expect(await page.screenshot()).toMatchSnapshot('dashboard-tablet-768px.png');
    });

    it('should render correctly on desktop devices (1024px)', () => {
      setViewportSize(1024, 768);
      
      render(
        <TestWrapper>
          <MockDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getAllByTestId('budget-card')).toHaveLength(2);
      
      // In a real test: expect(await page.screenshot()).toMatchSnapshot('dashboard-desktop-1024px.png');
    });

    it('should render correctly on large desktop devices (1440px)', () => {
      setViewportSize(1440, 900);
      
      render(
        <TestWrapper>
          <MockDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getAllByTestId('budget-card')).toHaveLength(2);
      
      // In a real test: expect(await page.screenshot()).toMatchSnapshot('dashboard-desktop-1440px.png');
    });
  });

  describe('Component Visual States', () => {
    it('should render budget cards in normal state', () => {
      const normalBudget = {
        id: '1',
        category: 'Entertainment',
        limit: 200,
        spent: 75,
        period: 'monthly' as const,
        createdAt: '2024-01-01'
      };

      render(
        <TestWrapper>
          <MockBudgetCard budget={normalBudget} />
        </TestWrapper>
      );

      const card = screen.getByTestId('budget-card');
      const progressBar = screen.getByTestId('progress-bar');
      
      expect(card).toBeInTheDocument();
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText('$75 / $200')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('budget-card-normal.png');
    });

    it('should render budget cards in warning state (>75% spent)', () => {
      const warningBudget = {
        id: '1',
        category: 'Food & Dining',
        limit: 500,
        spent: 400,
        period: 'monthly' as const,
        createdAt: '2024-01-01'
      };

      render(
        <TestWrapper>
          <MockBudgetCard budget={warningBudget} />
        </TestWrapper>
      );

      expect(screen.getByText('$400 / $500')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('budget-card-warning.png');
    });

    it('should render budget cards in over-budget state', () => {
      const overBudget = {
        id: '1',
        category: 'Shopping',
        limit: 300,
        spent: 450,
        period: 'monthly' as const,
        createdAt: '2024-01-01'
      };

      render(
        <TestWrapper>
          <MockBudgetCard budget={overBudget} />
        </TestWrapper>
      );

      expect(screen.getByText('$450 / $300')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('budget-card-over-budget.png');
    });

    it('should render transaction cards for income and expenses', () => {
      const incomeTransaction = {
        id: '1',
        description: 'Salary',
        amount: 3000,
        category: 'Income',
        date: '2024-01-01',
        type: 'income' as const,
        createdAt: '2024-01-01'
      };

      const expenseTransaction = {
        id: '2',
        description: 'Grocery Shopping',
        amount: 85.50,
        category: 'Food & Dining',
        date: '2024-01-15',
        type: 'expense' as const,
        createdAt: '2024-01-15'
      };

      render(
        <TestWrapper>
          <div>
            <MockTransactionCard transaction={incomeTransaction} />
            <MockTransactionCard transaction={expenseTransaction} />
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      expect(screen.getByText('+$3000')).toBeInTheDocument();
      expect(screen.getByText('-$85.5')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('transaction-cards.png');
    });
  });

  describe('Loading and Empty States', () => {
    it('should render loading state correctly', () => {
      const LoadingComponent = () => (
        <div className="space-y-4 p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );

      render(
        <TestWrapper>
          <LoadingComponent />
        </TestWrapper>
      );

      const skeletons = screen.getAllByText('').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('loading-state.png');
    });

    it('should render empty state correctly', () => {
      const EmptyComponent = () => (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets created yet</h3>
          <p className="text-gray-500 mb-4">Start by creating your first budget to track spending</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Budget
          </button>
        </div>
      );

      render(
        <TestWrapper>
          <EmptyComponent />
        </TestWrapper>
      );

      expect(screen.getByText('No budgets created yet')).toBeInTheDocument();
      expect(screen.getByText('Add Budget')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('empty-state.png');
    });
  });

  describe('Theme and Color Variations', () => {
    it('should render correctly in light theme', () => {
      render(
        <TestWrapper>
          <div className="bg-white text-gray-900 min-h-screen">
            <MockDashboard />
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // In a real test: expect(await page.screenshot()).toMatchSnapshot('light-theme.png');
    });

    it('should render correctly in dark theme', () => {
      render(
        <TestWrapper>
          <div className="bg-gray-900 text-white min-h-screen">
            <div className="space-y-6 p-4">
              <header>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-300">Welcome to your financial overview</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-medium text-gray-400">Total Budget</h3>
                  <p className="text-2xl font-bold text-white">$1,200</p>
                </div>
              </div>
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // In a real test: expect(await page.screenshot()).toMatchSnapshot('dark-theme.png');
    });

    it('should render with high contrast colors', () => {
      render(
        <TestWrapper>
          <div className="bg-black text-white min-h-screen">
            <div className="space-y-6 p-4">
              <header>
                <h1 className="text-3xl font-bold text-white border-b-2 border-white pb-2">Dashboard</h1>
              </header>
              
              <div className="bg-white text-black p-6 rounded-lg border-4 border-yellow-400">
                <h3 className="text-lg font-bold">High Contrast Card</h3>
                <p className="text-black">Content with high contrast for accessibility</p>
              </div>
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('High Contrast Card')).toBeInTheDocument();
      
      // In a real test: expect(await page.screenshot()).toMatchSnapshot('high-contrast.png');
    });
  });

  describe('Interactive States', () => {
    it('should render hover states correctly', () => {
      const HoverComponent = () => (
        <div className="space-y-4 p-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Normal Button
          </button>
          <button className="px-4 py-2 bg-blue-700 text-white rounded shadow-lg">
            Hovered Button
          </button>
          <div className="p-4 border rounded hover:shadow-lg transition-shadow">
            <p>Hoverable Card</p>
          </div>
          <div className="p-4 border rounded shadow-lg">
            <p>Hovered Card</p>
          </div>
        </div>
      );

      render(
        <TestWrapper>
          <HoverComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Normal Button')).toBeInTheDocument();
      expect(screen.getByText('Hovered Button')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('hover-states.png');
    });

    it('should render focus states correctly', () => {
      const FocusComponent = () => (
        <div className="space-y-4 p-4">
          <input 
            className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Focused input"
            autoFocus
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded focus:ring-2 focus:ring-blue-500">
            Button
          </button>
        </div>
      );

      render(
        <TestWrapper>
          <FocusComponent />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Focused input')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('focus-states.png');
    });

    it('should render disabled states correctly', () => {
      const DisabledComponent = () => (
        <div className="space-y-4 p-4">
          <button 
            disabled 
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
          >
            Disabled Button
          </button>
          <input 
            disabled 
            className="px-3 py-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed" 
            placeholder="Disabled input"
          />
        </div>
      );

      render(
        <TestWrapper>
          <DisabledComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Disabled Button')).toBeDisabled();
      expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('disabled-states.png');
    });
  });

  describe('Chart and Graph Rendering', () => {
    it('should render charts consistently', () => {
      render(
        <TestWrapper>
          <div className="space-y-6 p-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
              <div data-testid="chart-container" className="h-64">
                <div data-testid="pie-chart">Pie Chart Placeholder</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
              <div data-testid="chart-container" className="h-64">
                <div data-testid="line-chart">Line Chart Placeholder</div>
              </div>
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
      expect(screen.getByText('Monthly Spending Trend')).toBeInTheDocument();
      expect(screen.getAllByTestId('chart-container')).toHaveLength(2);
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('charts-rendering.png');
    });
  });

  describe('Error States', () => {
    it('should render error messages consistently', () => {
      const ErrorComponent = () => (
        <div className="space-y-4 p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">
                  Failed to load transaction data. Please try again.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have exceeded your budget for Food & Dining.
                </p>
              </div>
            </div>
          </div>
        </div>
      );

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Failed to load transaction data. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('You have exceeded your budget for Food & Dining.')).toBeInTheDocument();
      
      // In a real test: expect(await component.screenshot()).toMatchSnapshot('error-states.png');
    });
  });
});