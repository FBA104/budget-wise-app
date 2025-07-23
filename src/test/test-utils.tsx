/**
 * test-utils - custom render function with providers for testing
 * Wraps components with all necessary providers (React Query, Router, Tooltips)
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// create a test-specific query client with disabled retries for faster tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // disable retries in tests for predictable behavior
      },
    },
  });

// props interface for the providers wrapper component
interface AllTheProvidersProps {
  children: React.ReactNode; // components to wrap with providers
}

// wrapper component that provides all necessary context providers for testing
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient(); // create fresh client for each test

  return (
    <QueryClientProvider client={queryClient}> {/* React Query for server state */}
      <BrowserRouter> {/* Router for navigation testing */}
        <TooltipProvider> {/* Tooltip context for UI components */}
          {children} {/* the actual component being tested */}
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// custom render function that automatically wraps components with providers
const customRender = (
  ui: ReactElement, // the React component to render
  options?: Omit<RenderOptions, 'wrapper'>, // additional render options
) => render(ui, { wrapper: AllTheProviders, ...options }); // render with providers wrapper

export * from '@testing-library/react';
export { customRender as render };