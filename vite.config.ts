/**
 * Budget-Wise: Vite Configuration
 * 
 * Purpose: Development server and build configuration for the Budget-Wise application
 * Author: Budget-Wise Development Team
 * Created: 2024
 * Last Modified: 2025-01-07
 * 
 * Description: This configuration file sets up Vite for development and production builds.
 * It configures the React plugin with SWC for fast compilation, sets up path aliases
 * for cleaner imports, and configures the development server settings.
 * 
 * Key Features:
 * - React support with SWC for fast refresh and compilation
 * - Path alias (@) for src directory to enable absolute imports
 * - Development server configuration for local development
 * - IPv6 support for broader network accessibility
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite configuration object - see https://vitejs.dev/config/ for all options
export default defineConfig({
  // Development server configuration
  server: {
    // Accept connections on all network interfaces (IPv4 and IPv6)
    // This allows access from other devices on the local network
    host: "::",
    
    // Default development server port
    // Will automatically find next available port if 8082 is occupied
    port: 8082,
  },
  
  // Build plugins configuration
  plugins: [
    // React plugin with SWC compiler for fast refresh and TypeScript support
    // SWC provides faster compilation compared to Babel
    react()
  ],
  
  // Module resolution configuration
  resolve: {
    alias: {
      // Path alias to enable absolute imports from src directory
      // Example: import Component from '@/components/Component' instead of '../../components/Component'
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Test configuration
  test: {
    // Test environment (jsdom for React components)
    environment: 'jsdom',
    
    // Setup files to run before tests
    setupFiles: ['./src/test-utils/setup.ts'],
    
    // Global test settings
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
});
