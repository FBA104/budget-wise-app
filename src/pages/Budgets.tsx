/**
 * Budgets - manage spending limits and track progress
 */

import { useState } from 'react';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Budget } from '@/types/budget';
import { Plus, PiggyBank } from 'lucide-react';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetStats } from '@/components/budgets/BudgetStats';

export default function Budgets() {
  // get budget data and CRUD operations from main hook
  const { budgets, addBudget, updateBudget, deleteBudget, categories } = useBudgetData();
  const { toast } = useToast(); // for showing notifications
  
  // dialog states for add/edit modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // controls add budget dialog
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null); // currently editing budget (null = not editing)
  
  // form state with defaults
  const [formData, setFormData] = useState({
    category: '', // selected category name
    limit: '', // spending limit amount as string
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly', // default to monthly budgets
  });

  // handle form submission for both create and edit operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    
    // validate required fields
    if (!formData.category || !formData.limit) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // check for duplicate budgets in the same category (exclude current when editing)
    const existingBudget = budgets.find(b => b.category === formData.category && b.id !== editingBudget?.id);
    if (existingBudget) {
      toast({
        title: 'Error',
        description: 'A budget already exists for this category.',
        variant: 'destructive',
      });
      return;
    }

    // determine if we're editing or creating
    if (editingBudget) {
      // update existing budget
      updateBudget(editingBudget.id, {
        category: formData.category,
        limit: parseFloat(formData.limit), // convert string to number
        period: formData.period,
      });
      toast({ title: 'Success', description: 'Budget updated successfully!' });
      setEditingBudget(null); // exit edit mode
    } else {
      // create new budget
      addBudget({
        category: formData.category,
        limit: parseFloat(formData.limit), // convert string to number
        period: formData.period,
      });
      toast({ title: 'Success', description: 'Budget created successfully!' });
      setIsAddDialogOpen(false); // close add dialog
    }

    // reset form to defaults
    setFormData({ category: '', limit: '', period: 'monthly' });
  };

  // prepare budget for editing - populate form with existing data
  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget); // set edit mode
    setFormData({
      category: budget.category, // pre-fill category
      limit: budget.limit.toString(), // convert number to string for form
      period: budget.period, // pre-fill period
    });
  };

  // handle budget deletion with user confirmation
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) { // confirm with user
      deleteBudget(id); // delete from database
      toast({ title: 'Success', description: 'Budget deleted successfully!' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Title and Add Budget Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits and track your progress
          </p>
        </div>
        
        {/* Add Budget Dialog Trigger */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <Plus className="w-4 h-4 mr-2" /> {/* plus icon */}
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category to track your expenses.
              </DialogDescription>
            </DialogHeader>
            {/* Budget creation form component - reusable form with category dropdown */}
            <BudgetForm
              categories={categories} // available expense categories
              formData={formData} // current form state
              setFormData={setFormData} // function to update form state
              onSubmit={handleSubmit} // form submission handler
              onCancel={() => setIsAddDialogOpen(false)} // close dialog without saving
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Statistics Overview Component - shows total limits, spent, remaining */}
      <BudgetStats budgets={budgets} />

      {/* Budgets List Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Budgets ({budgets.length})</CardTitle> {/* show count */}
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            // Empty state when no budgets exist
            <div className="text-center py-12">
              <PiggyBank className="w-16 h-16 text-muted-foreground mx-auto mb-4" /> {/* large piggy bank icon */}
              <p className="text-muted-foreground mb-2">No budgets created yet</p>
              <p className="text-sm text-muted-foreground">
                Start by creating your first budget to track spending
              </p>
            </div>
          ) : (
            // List of budget cards with progress tracking and action buttons
            <div className="space-y-6">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget} // budget data with spending progress
                  onEdit={handleEdit} // edit button handler
                  onDelete={handleDelete} // delete button handler
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Budget Modal Dialog - opens when editingBudget is not null */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update the spending limit for this category.
            </DialogDescription>
          </DialogHeader>
          {/* Budget editing form component - same form as create but pre-filled */}
          <BudgetForm
            categories={categories} // available expense categories
            formData={formData} // current form state (pre-filled with budget data)
            setFormData={setFormData} // function to update form state
            onSubmit={handleSubmit} // form submission handler (handles both create and edit)
            onCancel={() => setEditingBudget(null)} // close dialog and exit edit mode
            isEditing={true} // flag to show "Update" instead of "Create" button
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}