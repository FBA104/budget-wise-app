/**
 * RecentTransactions - shows last 5 transactions on dashboard
 * Displays transaction icon, description, category and amount
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category } from '@/types/budget';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Briefcase,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Laptop,
  TrendingUp,
  Home,
  Gamepad2,
  GraduationCap,
  Tag
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onViewAll: () => void;
}

// map of icon names to components
const iconMap = {
  DollarSign,
  Briefcase,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Laptop,
  TrendingUp,
  Home,
  Gamepad2,
  GraduationCap,
  Tag,
};

export function RecentTransactions({ transactions, categories, onViewAll }: RecentTransactionsProps) {
  // only show first 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // get icon and color for a category
  const getCategoryInfo = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return {
      icon: category?.icon || 'DollarSign',
      color: category?.color || '#3b82f6',
    };
  };

  // convert icon name to component
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || DollarSign;
  };

  // format amount with + or - prefix
  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewAll}
          className="text-primary hover:bg-primary/10"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.length === 0 ? (
          // empty state
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Start by adding your first transaction</p>
          </div>
        ) : (
          // transaction list
          recentTransactions.map((transaction) => {
            const categoryInfo = getCategoryInfo(transaction.category);
            const IconComponent = getIconComponent(categoryInfo.icon);
            
            return (
              <div key={transaction.id} className="flex items-center space-x-4">
                {/* category icon with color */}
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${categoryInfo.color}20` }}
                >
                  <IconComponent 
                    className="w-4 h-4" 
                    style={{ color: categoryInfo.color }}
                  />
                </div>
              
              {/* description and meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.category} • {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                </p>
              </div>
              
              {/* amount */}
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
              </div>
              
            </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}