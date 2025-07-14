/**
 * BudgetOverview - shows budget progress cards
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Budget } from '@/types/budget';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface BudgetOverviewProps {
  budgets: Budget[];
}
export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  // determine budget health based on spending percentage
  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100; // calculate % spent
    if (percentage >= 100) return 'exceeded'; // over budget
    if (percentage >= 80) return 'warning'; // close to limit
    return 'good'; // safe zone
  };

  // get icon for budget status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <AlertTriangle className="w-4 h-4 text-destructive" />; // red warning
      case 'warning':
        return <Clock className="w-4 h-4 text-warning" />; // yellow caution
      default:
        return <CheckCircle className="w-4 h-4 text-success" />; // green check
    }
  };

  // get color for progress bar
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-destructive'; // red
      case 'warning': return 'bg-warning'; // yellow
      default: return 'bg-success'; // green
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show empty state if no budgets exist */}
        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No budgets set yet</p>
            <p className="text-sm text-muted-foreground">Create budgets to track your spending</p>
          </div>
        ) : (
          // Render each budget with status indicators and progress
          budgets.map((budget) => {
            // Calculate budget status and spending percentage
            const status = getBudgetStatus(budget);
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            
            return (
              <div key={budget.id} className="space-y-2">
                {/* Budget header with icon, name, and amounts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Status icon (success/warning/error) */}
                    {getStatusIcon(status)}
                    {/* Budget category name */}
                    <span className="font-medium text-foreground">{budget.category}</span>
                  </div>
                  {/* Spent / Total amounts */}
                  <span className="text-sm text-muted-foreground">
                    ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                  </span>
                </div>
                
                {/* Progress bar with dynamic color based on status */}
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    '--progress-background': `hsl(var(--${getStatusColor(status).replace('bg-', '')}))`
                  } as React.CSSProperties}
                />
                
                {/* Progress details - percentage used and remaining amount */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(0)}% used</span>
                  <span>${(budget.limit - budget.spent).toFixed(2)} remaining</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}