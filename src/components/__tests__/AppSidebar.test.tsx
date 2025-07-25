/**
 * AppSidebar test suite
 * Tests navigation structure, links, and sidebar behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock the useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false // Desktop by default
}));

// Remove the mock since we're using the actual SidebarProvider

// wrapper component that provides all necessary context for sidebar testing
const AppSidebarWithProvider = () => (
  <BrowserRouter> {/* provides routing context */}
    <SidebarProvider> {/* provides sidebar context */}
      <AppSidebar /> {/* the component being tested */}
    </SidebarProvider>
  </BrowserRouter>
);

describe('AppSidebar Component', () => {
  it('renders the Budget Wise title', () => {
    render(<AppSidebarWithProvider />); // render sidebar with providers
    expect(screen.getByText('Budget Wise')).toBeInTheDocument(); // verify app title is displayed
  });

  it('renders all navigation items', () => {
    render(<AppSidebarWithProvider />); // render sidebar with providers
    
    // verify all main navigation items are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument(); // main overview page
    expect(screen.getByText('Transactions')).toBeInTheDocument(); // transaction list
    expect(screen.getByText('Budgets')).toBeInTheDocument(); // budget management
    expect(screen.getByText('Goals')).toBeInTheDocument(); // savings goals
    expect(screen.getByText('Reports')).toBeInTheDocument(); // analytics page
    expect(screen.getByText('Categories')).toBeInTheDocument(); // category management
    expect(screen.getByText('Data')).toBeInTheDocument(); // import/export
    expect(screen.getByText('Recurring')).toBeInTheDocument(); // recurring transactions
  });

  it('renders quick actions section', () => {
    render(<AppSidebarWithProvider />); // render sidebar with providers
    
    // verify quick actions section exists
    expect(screen.getByText('Quick Actions')).toBeInTheDocument(); // section header
    expect(screen.getByText('Add Transaction')).toBeInTheDocument(); // main quick action
  });

  it('has correct navigation links', () => {
    render(<AppSidebarWithProvider />); // render sidebar with providers
    
    // verify navigation links point to correct routes
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/'); // root path for dashboard
    
    const transactionsLink = screen.getByRole('link', { name: /transactions/i });
    expect(transactionsLink).toHaveAttribute('href', '/transactions'); // transactions page path
    
    const addTransactionLink = screen.getByRole('link', { name: /add transaction/i });
    expect(addTransactionLink).toHaveAttribute('href', '/add-transaction'); // add transaction form path
  });

  it('shows Navigation and Quick Actions group labels', () => {
    render(<AppSidebarWithProvider />); // render sidebar with providers
    
    // verify section headers are displayed for better organization
    expect(screen.getByText('Navigation')).toBeInTheDocument(); // main navigation section header
    expect(screen.getByText('Quick Actions')).toBeInTheDocument(); // quick actions section header
  });
});