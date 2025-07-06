/**
 * Budget-Wise: Main Application Component
 * 
 * Purpose: Root component that orchestrates the entire Budget-Wise application
 * Author: Budget-Wise Development Team
 * Created: 2024
 * Last Modified: 2025-01-07
 * 
 * Description: This component serves as the main application container, managing
 * authentication state, routing, and global providers. It implements conditional
 * routing based on user authentication status and provides the necessary context
 * for React Query, tooltips, and toast notifications throughout the application.
 * 
 * Key Responsibilities:
 * - Authentication state management using Supabase Auth
 * - Conditional routing for authenticated and unauthenticated users
 * - Global provider setup (React Query, Tooltips, Toasters)
 * - Loading state management during authentication checks
 * - Route protection and automatic redirects
 */

// UI Components and Providers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Data Management and Routing
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// React Hooks and Supabase Integration
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Layout and Page Components
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Data from "./pages/Data";
import RecurringTransactions from "./pages/RecurringTransactions";
import AddTransaction from "./pages/AddTransaction";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Initialize React Query client with default configuration
// This provides caching and synchronization for server state management
const queryClient = new QueryClient();

/**
 * Main Application Component
 * 
 * Manages the overall application state, authentication, and routing.
 * Renders different route configurations based on user authentication status.
 * 
 * @returns {JSX.Element} The complete application with providers and routing
 */
const App = () => {
  // Authentication state - tracks current user session
  const [session, setSession] = useState<Session | null>(null);
  
  // Loading state - prevents flash of incorrect content during auth check
  const [loading, setLoading] = useState(true);

  // Set up authentication state management and listeners
  useEffect(() => {
    // Retrieve the current session on app initialization
    // This handles cases where user has an existing valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Subscribe to authentication state changes
    // This handles login, logout, token refresh, and session expiration
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Cleanup subscription on component unmount to prevent memory leaks
    return () => subscription.unsubscribe();
  }, []);

  // Show loading spinner while checking authentication status
  // Prevents flash of login screen for authenticated users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    // React Query provider for server state management and caching
    <QueryClientProvider client={queryClient}>
      {/* Tooltip provider for consistent tooltip behavior across the app */}
      <TooltipProvider>
        {/* Toast notification systems for user feedback */}
        <Toaster />
        <Sonner />
        
        {/* Browser router for client-side navigation */}
        <BrowserRouter>
          <Routes>
            {/* Authenticated user routes - full application access */}
            {session ? (
              <>
                {/* Main application pages wrapped in layout */}
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
                <Route path="/budgets" element={<Layout><Budgets /></Layout>} />
                <Route path="/goals" element={<Layout><Goals /></Layout>} />
                <Route path="/reports" element={<Layout><Reports /></Layout>} />
                <Route path="/categories" element={<Layout><Categories /></Layout>} />
                <Route path="/data" element={<Layout><Data /></Layout>} />
                <Route path="/recurring" element={<Layout><RecurringTransactions /></Layout>} />
                <Route path="/add-transaction" element={<Layout><AddTransaction /></Layout>} />
                
                {/* Allow access to auth page for logout functionality */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Catch-all route for undefined paths */}
                <Route path="*" element={<NotFound />} />
              </>
            ) : (
              <>
                {/* Unauthenticated user routes - restricted to auth page */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Redirect all other paths to authentication */}
                <Route path="*" element={<Auth />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
