/**
 * AppSidebar - main navigation sidebar
 */

import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, PiggyBank, Target, BarChart3, Tag, Database, Repeat, Plus } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

/**
 * Main navigation items for the sidebar
 * Each item includes title, URL path, and associated icon
 */
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    url: '/transactions',
    icon: CreditCard,
  },
  {
    title: 'Budgets',
    url: '/budgets',
    icon: PiggyBank,
  },
  {
    title: 'Goals',
    url: '/goals',
    icon: Target,
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Categories',
    url: '/categories',
    icon: Tag,
  },
  {
    title: 'Data',
    url: '/data',
    icon: Database,
  },
  {
    title: 'Recurring',
    url: '/recurring',
    icon: Repeat,
  },
];

/**
 * Quick action items for frequently used functions
 * Separated from main navigation for better UX
 */
const quickActions = [
  {
    title: 'Add Transaction',
    url: '/add-transaction',
    icon: Plus,
  },
];

/**
 * AppSidebar Component
 * 
 * Renders the main navigation sidebar with collapsible functionality.
 * Features:
 * - Collapsible sidebar that shows/hides text labels
 * - Active route highlighting
 * - Grouped navigation (main nav + quick actions)
 * - Responsive design with proper icon-only mode
 */
export function AppSidebar() {
  // Get sidebar state from context to determine if collapsed
  const { state } = useSidebar();
  // Get current location for active route highlighting
  const location = useLocation();
  // Determine if sidebar is in collapsed state
  const collapsed = state === 'collapsed';
  
  /**
   * Determines if a given path is the currently active route
   * Special handling for root path to avoid matching all routes
   * @param path - The route path to check
   * @returns boolean indicating if the path is active
   */
  const isActive = (path: string) => {
    if (path === '/') {
      // Exact match for home route to avoid matching all routes
      return location.pathname === '/';
    }
    // Use startsWith for nested routes (e.g., /transactions/add)
    return location.pathname.startsWith(path);
  };

  /**
   * Generates appropriate CSS classes for navigation items
   * Active items get accent styling, inactive get hover effects
   * @param path - The route path to generate classes for
   * @returns CSS class string for styling
   */
  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? 'bg-accent text-accent-foreground font-medium' 
      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground';
  };

  return (
    // Sidebar with conditional width based on collapsed state
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-card">
        {/* App branding section - only visible when expanded */}
        <div className="p-4">
          <div className="flex items-center space-x-2">
            {!collapsed && (
              <span className="font-bold text-lg text-foreground">Budget Wise</span>
            )}
          </div>
        </div>

        {/* Main navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      {/* Icon is always visible */}
                      <item.icon className="w-4 h-4" />
                      {/* Text label only visible when not collapsed */}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick actions group for frequently used functions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      {/* Icon is always visible */}
                      <item.icon className="w-4 h-4" />
                      {/* Text label only visible when not collapsed */}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}