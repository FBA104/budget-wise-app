/**
 * BudgetCard - individual budget progress card
 */

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Budget } from '@/types/budget';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2
} from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  // determine budget status based on spending percentage
  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100; // calculate spent percentage
    if (percentage >= 100) return { status: 'exceeded', color: 'destructive', icon: AlertTriangle }; // over budget (red)
    if (percentage >= 80) return { status: 'warning', color: 'warning', icon: Clock }; // approaching limit (yellow)
    return { status: 'good', color: 'success', icon: CheckCircle }; // within budget (green)
  };

  const { status, color, icon: StatusIcon } = getBudgetStatus(budget); // get status info
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100); // cap percentage at 100%
  
  return (
    <div className="p-4 border rounded-lg space-y-4"> {/* budget card container */}
      {/* header section with status and actions */}
      <div className="flex items-center justify-between">
        {/* left side - status icon and budget info */}
        <div className="flex items-center space-x-3">
          <StatusIcon className={`w-5 h-5 text-${color}`} /> {/* status icon with dynamic color */}
          <div>
            <h3 className="font-semibold">{budget.category}</h3> {/* budget category name */}
            <p className="text-sm text-muted-foreground capitalize">
              {budget.period} budget {/* period (monthly, weekly, yearly) */}
            </p>
          </div>
        </div>
        
        {/* right side - action buttons */}
        <div className="flex items-center space-x-2">
          {/* edit budget button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(budget)} // trigger edit callback
          >
            <Edit className="w-4 h-4" />
          </Button>
          {/* delete budget button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(budget.id)} // trigger delete callback
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* progress section with spending details */}
      <div className="space-y-2">
        {/* spent vs limit amounts */}
        <div className="flex justify-between text-sm">
          <span>${budget.spent.toFixed(2)} spent</span> {/* amount spent so far */}
          <span>${budget.limit.toFixed(2)} limit</span> {/* total budget limit */}
        </div>
        
        {/* visual progress bar */}
        <Progress value={percentage} className="h-2" /> {/* progress bar showing percentage used */}
        
        {/* percentage and remaining amount */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(0)}% used</span> {/* percentage of budget used */}
          <span>${(budget.limit - budget.spent).toFixed(2)} remaining</span> {/* amount left to spend */}
        </div>
      </div>
    </div>
  );
}