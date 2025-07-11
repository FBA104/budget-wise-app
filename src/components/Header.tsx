/**
 * Header - main app header with sidebar toggle and user menu
 */

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
export function Header() {
  const { toast } = useToast(); // for showing notification messages

  // handle user logout - signs out from supabase and shows confirmation
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut(); // sign out from supabase
      if (error) throw error;
      
      // show success message
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      // show error message if sign out fails
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-card shadow-card"> {/* fixed header with border and shadow */}
      <div className="flex h-16 items-center px-6"> {/* header content container with fixed height */}
        {/* sidebar toggle button - allows users to collapse/expand sidebar */}
        <SidebarTrigger className="mr-4" />
        
        {/* app title section - takes up remaining space */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            Budget Wise {/* application name/branding */}
          </h1>
        </div>

        {/* user actions section - right side of header */}
        <div className="flex items-center space-x-4">
          {/* notifications button - placeholder for future notification system */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" /> {/* bell icon for notifications */}
          </Button>
          
          {/* user menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" /> {/* user profile icon */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"> {/* dropdown aligned to right edge */}
              <DropdownMenuItem onClick={handleSignOut}> {/* sign out menu item */}
                <LogOut className="mr-2 h-4 w-4" /> {/* logout icon */}
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}