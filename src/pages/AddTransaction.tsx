/**
 * AddTransaction - form to create new transactions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, categories } = useBudgetData();
  const { toast } = useToast();
  
  // form state with defaults
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense', // default to expense (more common)
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // today's date in YYYY-MM-DD format
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles form submission with validation and error handling
   * Validates required fields, submits transaction, and provides user feedback
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields before submission
    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit transaction with proper data types
      addTransaction({
        type: formData.type,
        amount: parseFloat(formData.amount), // Convert string to number
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      // Show success message with dynamic text based on transaction type
      toast({
        title: 'Success',
        description: `${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
      });

      // Navigate back to transactions list
      navigate('/transactions');
    } catch (error) {
      // Show error message if submission fails
      toast({
        title: 'Error',
        description: 'Failed to add transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Always reset loading state
      setIsSubmitting(false);
    }
  };

  // Separate categories by type for organized dropdown display
  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Transaction</h1>
          <p className="text-muted-foreground">
            Record a new income or expense transaction
          </p>
        </div>
      </div>

      <Card className="max-w-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Transaction</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({ ...prev, type: value, category: '' })) // clear category when type changes
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem> {/* spending money */}
                  <SelectItem value="income">Income</SelectItem> {/* receiving money */}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">$</span> {/* dollar sign prefix */}
                <Input
                  id="amount"
                  type="number"
                  step="0.01" // allow cents (2 decimal places)
                  min="0" // no negative amounts allowed
                  placeholder="0.00"
                  value={formData.amount} // controlled input
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} // update form state
                  className="pl-8" // pad left for dollar sign
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} // update selected category
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Expense Categories</SelectLabel>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name} {/* display category name */}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Income Categories</SelectLabel>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name} {/* display category name */}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter transaction description..."
                value={formData.description} // controlled textarea
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} // update form state
                rows={3} // 3 rows tall
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date" // date picker input
                value={formData.date} // defaults to today
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} // update form state
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting} // disable while submitting
                className="bg-gradient-primary hover:bg-primary-hover"
              >
                {isSubmitting ? 'Adding...' : 'Add Transaction'} {/* show loading text */}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/transactions')} // go back to transactions page
                disabled={isSubmitting} // disable while submitting
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}