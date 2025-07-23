/**
 * Test setup utilities and global mocks
 */

import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom/vitest';

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const icons = [
    'DollarSign', 'TrendingUp', 'TrendingDown', 'Target', 'PiggyBank',
    'Home', 'CreditCard', 'Wallet', 'ChartLine', 'FileText', 'Tag',
    'Database', 'RefreshCw', 'Plus', 'MoreHorizontal', 'Calendar',
    'Filter', 'Download', 'ArrowUpRight', 'ArrowDownRight', 'Check',
    'X', 'AlertCircle', 'Info', 'ChevronLeft', 'ChevronRight', 'Search',
    'Menu', 'Settings', 'LogOut', 'User', 'Bell', 'HelpCircle', 'Loader2',
    'Upload', 'File', 'Trash', 'Edit', 'Save', 'Copy', 'ExternalLink',
    'BarChart', 'PieChart', 'LineChart', 'Activity', 'ShoppingCart',
    'Coffee', 'Car', 'Gamepad', 'Heart', 'Book', 'Briefcase', 'Gift',
    'Lightbulb', 'Music', 'Plane', 'ShoppingBag', 'Tv', 'Users', 'Zap',
    'Clock', 'CheckCircle', 'Shield', 'XCircle', 'AlertTriangle',
    'ChevronDown', 'ChevronUp', 'BarChart3', 'LayoutDashboard', 'Repeat',
    'Trash2', 'UtensilsCrossed', 'MoreVertical'
  ];
  
  const mocks: any = {};
  icons.forEach(icon => {
    mocks[icon] = vi.fn(({ className, ...props }: any) =>
      React.createElement('div', {
        className,
        'data-testid': `lucide-${icon}`,
        ...props
      })
    );
  });
  
  return mocks;
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.alert, confirm, etc.
global.alert = vi.fn();
global.confirm = vi.fn();
global.prompt = vi.fn();

// Mock scrollTo
global.scrollTo = vi.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific React warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('act(...)'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Remove duplicate mock since it's already hoisted above

export {};