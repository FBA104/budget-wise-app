/**
 * Budget-Wise: Vitest Testing Configuration
 * 
 * Purpose: Unit and integration testing configuration for the Budget-Wise application
 * Author: Budget-Wise Development Team
 * Created: 2024
 * Last Modified: 2025-01-07
 * 
 * Description: This configuration file sets up Vitest for running automated tests.
 * It configures React testing with jsdom environment for DOM simulation,
 * sets up global test utilities, and establishes test setup files for
 * consistent test environment initialization.
 * 
 * Key Features:
 * - jsdom environment for React component testing
 * - Global test functions (describe, it, expect) available without imports
 * - Automated setup with mocks for external dependencies
 * - Path aliases matching the main application configuration
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  // Use React plugin for testing React components
  plugins: [react()],
  
  // Test environment configuration
  test: {
    // Enable global test functions (describe, it, expect) without imports
    // This provides a more familiar Jest-like testing experience
    globals: true,
    
    // Use jsdom environment to simulate browser DOM for React component testing
    // This enables testing of components that interact with DOM elements
    environment: 'jsdom',
    
    // Setup files that run before each test file
    // Contains mocks for external dependencies like Supabase and React Router
    setupFiles: ['./src/test/setup.ts'],
  },
  
  // Module resolution configuration (matches main Vite config)
  resolve: {
    alias: {
      // Path alias for absolute imports in tests
      // Ensures tests can use the same import paths as the main application
      '@': path.resolve(__dirname, './src'),
    },
  },
});