/**
 * Budget-Wise: Application Layout Component
 * 
 * Purpose: Main layout wrapper providing consistent application structure
 * Author: Budget-Wise Development Team
 * Created: 2024
 * Last Modified: 2025-01-07
 * 
 * Description: This component defines the main application layout structure,
 * including the collapsible sidebar, header, and main content area. It provides
 * a consistent layout foundation for all authenticated pages in the application.
 * 
 * Layout Structure:
 * - Collapsible sidebar for navigation
 * - Fixed header with user controls and branding
 * - Flexible main content area for page-specific content
 * - Integrated toast notification system
 * - Responsive design for desktop and mobile devices
 */

// Sidebar provider and context for collapsible sidebar functionality
import { SidebarProvider } from '@/components/ui/sidebar';

// Main application sidebar component
import { AppSidebar } from '@/components/AppSidebar';

// Header component with user actions and branding
import { Header } from '@/components/Header';

// Toast notification system for user feedback
import { Toaster } from '@/components/ui/toaster';

/**
 * Props interface for the Layout component
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 * 
 * Main application layout wrapper that provides:
 * - Collapsible sidebar navigation
 * - Header with user controls
 * - Main content area for page content
 * - Toast notification system
 * - Responsive design structure
 * 
 * @param children - The page content to render in the main area
 */
export const Layout = ({ children }: LayoutProps) => {
  return (
    // Provides sidebar context for collapse/expand functionality
    <SidebarProvider>
      {/* Main layout container with full screen height and width */}
      <div className="min-h-screen flex w-full bg-background">
        {/* Collapsible sidebar navigation */}
        <AppSidebar />
        
        {/* Main content area with header and page content */}
        <div className="flex-1 flex flex-col">
          {/* Fixed header with user actions */}
          <Header />
          
          {/* Scrollable main content area with padding */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Global toast notification system */}
      <Toaster />
    </SidebarProvider>
  );
};