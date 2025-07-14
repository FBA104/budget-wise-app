/**
 * BudgetStats - overview stats for all budgets
 */

import { Card, CardContent } from '@/components/ui/card';
import { Budget } from '@/types/budget';
import { 
  PiggyBank,
  Clock,
  CheckCircle
} from 'lucide-react';

interface BudgetStatsProps {
  budgets: Budget[];
}

export function BudgetStats({ budgets }: BudgetStatsProps) {
  // calculate total budget limits across all budgets
  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  // calculate total amount spent across all budgets
  const totalBudgetSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* responsive 3-column grid */}
      {/* total budget limit card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-primary" /> {/* piggy bank icon */}
            <span className="font-medium">Total Budget</span>
          </div>
          <p className="text-2xl font-bold mt-2">${totalBudgetLimit.toFixed(2)}</p> {/* sum of all budget limits */}
        </CardContent>
      </Card>
      
      {/* total spent amount card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-warning" /> {/* clock icon (warning color) */}
            <span className="font-medium">Total Spent</span>
          </div>
          <p className="text-2xl font-bold mt-2">${totalBudgetSpent.toFixed(2)}</p> {/* sum of all amounts spent */}
        </CardContent>
      </Card>
      
      {/* remaining budget card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-success" /> {/* check circle icon (success color) */}
            <span className="font-medium">Remaining</span>
          </div>
          <p className="text-2xl font-bold mt-2">${(totalBudgetLimit - totalBudgetSpent).toFixed(2)}</p> {/* calculated remaining budget */}
        </CardContent>
      </Card>
    </div>
  );
}