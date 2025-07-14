/**
 * BudgetForm - form for creating/editing budgets
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/budget';

interface BudgetFormProps {
  categories: Category[];
  formData: {
    category: string;
    limit: string;
    period: 'monthly' | 'weekly' | 'yearly';
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    category: string;
    limit: string;
    period: 'monthly' | 'weekly' | 'yearly';
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function BudgetForm({ 
  categories, 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel,
  isEditing = false 
}: BudgetFormProps) {
  // filter to only show expense categories (budgets track spending limits)
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <form onSubmit={onSubmit} className="space-y-4"> {/* budget form container */}
      {/* category selection field */}
      <div className="space-y-2">
        <Label htmlFor={isEditing ? 'edit-category' : 'category'}>Category *</Label>
        <Select 
          value={formData.category} // controlled select
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} // update form state
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name} {/* category display name */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* budget limit amount field */}
      <div className="space-y-2">
        <Label htmlFor={isEditing ? 'edit-limit' : 'limit'}>Budget Limit *</Label>
        <div className="relative"> {/* container for input with dollar sign */}
          <span className="absolute left-3 top-3 text-muted-foreground">$</span> {/* dollar sign prefix */}
          <Input
            id={isEditing ? 'edit-limit' : 'limit'}
            type="number"
            step="0.01" // allow decimal amounts
            min="0" // prevent negative budgets
            placeholder="0.00"
            value={formData.limit} // controlled input
            onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))} // update form state
            className="pl-8" // padding for dollar sign
            required
          />
        </div>
      </div>

      {/* budget period selection field */}
      <div className="space-y-2">
        <Label htmlFor={isEditing ? 'edit-period' : 'period'}>Period *</Label>
        <Select 
          value={formData.period} // controlled select
          onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
            setFormData(prev => ({ ...prev, period: value })) // update form state
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem> {/* budget resets weekly */}
            <SelectItem value="monthly">Monthly</SelectItem> {/* budget resets monthly */}
            <SelectItem value="yearly">Yearly</SelectItem> {/* budget resets yearly */}
          </SelectContent>
        </Select>
      </div>

      {/* form action buttons */}
      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1"> {/* submit form */}
          {isEditing ? 'Update Budget' : 'Create Budget'} {/* dynamic button text based on mode */}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} // close form without saving
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}