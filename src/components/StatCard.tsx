/**
 * StatCard - shows financial stats on dashboard
 * Simple card with icon, title, value and change indicator
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string; // like "+5.2%" or "-2.1%"
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: string;
}
export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  gradient = 'bg-gradient-primary'
}: StatCardProps) {
  // colors for the change text
  const changeColors = {
    positive: 'text-success',
    negative: 'text-destructive', 
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      {/* title and icon row */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {/* colored icon */}
        <div className={`p-2 rounded-lg ${gradient}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      
      <CardContent>
        {/* main stat value */}
        <div className="text-2xl font-bold text-foreground">{value}</div>
        
        {/* change indicator if we have one */}
        {change && (
          <p className={`text-xs ${changeColors[changeType]} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}