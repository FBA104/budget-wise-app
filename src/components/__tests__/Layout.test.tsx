/**
 * Layout component test suite
 * Tests the main application layout structure and functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';

// Mock the UI components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

vi.mock('@/components/AppSidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Sidebar</div>,
}));

vi.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

describe('Layout Component', () => {
  it('should render all layout components', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    // Check that all layout components are rendered
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should render children in the main content area', () => {
    const testContent = 'This is test content for the layout';
    
    render(
      <Layout>
        <div>{testContent}</div>
      </Layout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    // Check main layout container
    const mainContainer = screen.getByTestId('sidebar-provider').firstChild;
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'w-full', 'bg-background');
  });

  it('should render sidebar and main content area side by side', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    const sidebar = screen.getByTestId('app-sidebar');
    const header = screen.getByTestId('header');
    const content = screen.getByTestId('test-content');

    // All elements should be in the document
    expect(sidebar).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('should render header above main content', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    const header = screen.getByTestId('header');
    const content = screen.getByTestId('test-content');

    // Header should come before content in DOM order
    expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should render toaster for notifications', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should wrap content in main element with proper classes', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1', 'p-6');
    expect(mainElement).toContainElement(screen.getByTestId('test-content'));
  });

  it('should handle multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </Layout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<Layout>{null}</Layout>);

    // Layout should still render with sidebar, header, and toaster
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should provide sidebar context through SidebarProvider', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // SidebarProvider should wrap the entire layout
    const sidebarProvider = screen.getByTestId('sidebar-provider');
    expect(sidebarProvider).toBeInTheDocument();
    
    // All other components should be children of SidebarProvider
    expect(sidebarProvider).toContainElement(screen.getByTestId('app-sidebar'));
    expect(sidebarProvider).toContainElement(screen.getByTestId('header'));
  });

  it('should have flex layout for responsive design', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check that the layout uses flexbox
    const layoutContainer = container.querySelector('.min-h-screen.flex');
    expect(layoutContainer).toBeInTheDocument();
  });

  it('should render with consistent background', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const layoutContainer = container.querySelector('.bg-background');
    expect(layoutContainer).toBeInTheDocument();
  });

  it('should maintain full screen height', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const layoutContainer = container.querySelector('.min-h-screen');
    expect(layoutContainer).toBeInTheDocument();
  });
});