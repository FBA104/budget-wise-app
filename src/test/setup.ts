/**
 * test setup - global mocks and test configuration
 * 
 * This file configures the testing environment by:
 * - Setting up jest-dom matchers for better assertions
 * - Mocking external dependencies (Supabase, React Router, Recharts)
 * - Providing consistent mock implementations across all tests
 */

import '@testing-library/jest-dom'; // adds custom jest matchers for DOM elements
import { vi } from 'vitest'; // vitest mocking utilities
import React from 'react';

// mock supabase client to avoid real database calls in tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(), // mock user retrieval
      signOut: vi.fn(), // mock sign out functionality
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } } // mock auth state subscription
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })) // mock session retrieval
    },
    from: vi.fn(() => ({ // mock database query builder
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })) // mock select queries
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })), // mock insert operations
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })) // mock update operations
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })) // mock delete operations
      }))
    }))
  }
}));

// mock React Router to avoid navigation in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom'); // preserve actual router implementation
  return {
    ...actual,
    useNavigate: () => vi.fn(), // mock navigation function
    useLocation: () => ({ pathname: '/' }), // mock current location as root
  };
});

// mock Recharts to avoid canvas/SVG rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children, // pass through children without container logic
  PieChart: ({ children }: any) => {
    return React.createElement('div', { 'data-testid': 'pie-chart' }, children); // render as simple div
  },
  Pie: () => React.createElement('div', { 'data-testid': 'pie' }), // mock pie chart element
  Cell: () => React.createElement('div', { 'data-testid': 'cell' }), // mock chart cells
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }), // mock chart tooltips
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }), // mock chart legends
}));