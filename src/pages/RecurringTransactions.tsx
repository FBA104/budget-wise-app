/**
 * RecurringTransactions - manage recurring income/expenses
 */

import { useState } from 'react';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RecurringTransaction } from '@/types/budget';
import { 
  Plus, 
  Edit,
  Trash2,
  Repeat,
  Calendar,
  DollarSign,
  Play,
  Pause,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export default function RecurringTransactions() {
  // get recurring transaction data and operations from main hook
  const { categories, recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, processRecurringTransactions, loading } = useBudgetData();
  const { toast } = useToast(); // for showing notifications
  
  // dialog and processing states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // controls add dialog
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null); // currently editing transaction
  const [isProcessing, setIsProcessing] = useState(false); // prevents multiple processing attempts
  
  // form state with defaults
  const [formData, setFormData] = useState({
    name: '', // transaction name/description
    type: 'expense' as 'income' | 'expense', // default to expense
    amount: '', // amount as string for form input
    category: '', // selected category
    description: '', // optional description
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly', // default to monthly
    frequencyValue: '1', // how often (every 1 month, every 2 weeks, etc.)
    startDate: new Date().toISOString().split('T')[0], // start from today
    endDate: '', // optional end date
  });

  // handle form submission for both create and edit operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    
    // validate required fields
    if (!formData.name || !formData.amount || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // validate amount is a positive number
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    // validate frequency value is a positive integer
    const frequencyValue = parseInt(formData.frequencyValue);
    if (isNaN(frequencyValue) || frequencyValue <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid frequency value.',
        variant: 'destructive',
      });
      return;
    }

    // determine if we're editing or creating
    if (editingTransaction) {
      // update existing recurring transaction
      updateRecurringTransaction(editingTransaction.id, {
        name: formData.name,
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description,
        frequency: formData.frequency,
        frequencyValue,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined, // convert empty string to undefined
      });
      setEditingTransaction(null); // exit edit mode
    } else {
      // create new recurring transaction
      addRecurringTransaction({
        name: formData.name,
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description,
        frequency: formData.frequency,
        frequencyValue,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined, // convert empty string to undefined
      });
      setIsAddDialogOpen(false); // close add dialog
    }

    // reset form to defaults
    setFormData({
      name: '',
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      frequency: 'monthly',
      frequencyValue: '1',
      startDate: new Date().toISOString().split('T')[0], // today's date
      endDate: '',
    });
  };

  // prepare transaction for editing - populate form with existing data
  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction); // set edit mode
    setFormData({
      name: transaction.name, // pre-fill name
      type: transaction.type, // pre-fill type
      amount: transaction.amount.toString(), // convert number to string for form
      category: transaction.category, // pre-fill category
      description: transaction.description || '', // pre-fill description or empty string
      frequency: transaction.frequency, // pre-fill frequency
      frequencyValue: transaction.frequencyValue.toString(), // convert number to string for form
      startDate: transaction.startDate, // pre-fill start date
      endDate: transaction.endDate || '', // pre-fill end date or empty string
    });
  };

  // toggle active/inactive status of recurring transaction
  const handleToggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive }); // update only the active status
  };

  // handle transaction deletion with user confirmation
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) { // confirm with user
      deleteRecurringTransaction(id); // delete from database
    }
  };

  // manually process all active recurring transactions
  const handleProcessNow = async () => {
    setIsProcessing(true); // disable button during processing
    try {
      const processed = await processRecurringTransactions(); // process all due transactions
      toast({
        title: 'Processing Complete',
        description: `${processed} recurring transactions were processed.`,
      });
    } catch (error: any) {
      // show error if processing fails
      toast({
        title: 'Processing Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false); // re-enable button
    }
  };

  // format frequency display for human readability
  const getFrequencyDisplay = (frequency: string, value: number) => {
    const unit = frequency.slice(0, -2); // Remove 'ly' suffix (daily -> dai, weekly -> week, etc.)
    return value === 1 ? `Every ${unit}` : `Every ${value} ${unit}s`; // "Every day" vs "Every 2 days"
  };

  // format next occurrence date for user-friendly display
  const getNextOccurrenceDisplay = (date: string) => {
    const nextDate = new Date(date);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime(); // time difference in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert to days
    
    if (diffDays === 0) return 'Today'; // due today
    if (diffDays === 1) return 'Tomorrow'; // due tomorrow
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`; // overdue
    return `In ${diffDays} days`; // future date
  };

  // separate transactions by active status for display
  const activeTransactions = recurringTransactions.filter(t => t.isActive); // currently running
  const inactiveTransactions = recurringTransactions.filter(t => !t.isActive); // paused/stopped

  // show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]"> {/* centered loading container */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div> {/* spinner */}
          <p className="text-muted-foreground">Loading recurring transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* page header with title and action buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recurring Transactions</h1>
          <p className="text-muted-foreground">
            Manage your automatic recurring income and expenses
          </p>
        </div>
        
        {/* action buttons section */}
        <div className="flex space-x-2">
          {/* process now button - manually trigger processing */}
          <Button
            onClick={handleProcessNow} // manually process all due transactions
            disabled={isProcessing || activeTransactions.length === 0} // disable if already processing or no active transactions
            variant="outline"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div> {/* spinner */}
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> {/* play icon */}
                Process Now
              </>
            )}
          </Button>
          
          {/* add recurring transaction dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:bg-primary-hover">
                <Plus className="w-4 h-4 mr-2" /> {/* plus icon */}
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Recurring Transaction</DialogTitle>
                <DialogDescription>
                  Set up an automatic recurring transaction.
                </DialogDescription>
              </DialogHeader>
              {/* recurring transaction creation form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* transaction name input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Monthly Salary, Weekly Groceries"
                    value={formData.name} // controlled input
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} // update form state
                    required
                  />
                </div>

                {/* type and amount row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* transaction type selector */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'income' | 'expense') => 
                        setFormData(prev => ({ ...prev, type: value })) // update type in form state
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem> {/* money coming in */}
                        <SelectItem value="expense">Expense</SelectItem> {/* money going out */}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* amount input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01" // allow decimal amounts
                      placeholder="0.00"
                      value={formData.amount} // controlled input
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} // update form state
                      required
                    />
                  </div>
                </div>

                {/* category selector */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} // update category in form state
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.type === formData.type) // only show categories matching selected type
                        .map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name} {/* category name */}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* optional description input */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description"
                    value={formData.description} // controlled input
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} // update form state
                  />
                </div>

                {/* frequency configuration row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* frequency period selector */}
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select 
                      value={formData.frequency} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                        setFormData(prev => ({ ...prev, frequency: value })) // update frequency in form state
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem> {/* every day */}
                        <SelectItem value="weekly">Weekly</SelectItem> {/* every week */}
                        <SelectItem value="monthly">Monthly</SelectItem> {/* every month */}
                        <SelectItem value="yearly">Yearly</SelectItem> {/* every year */}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* frequency value input */}
                  <div className="space-y-2">
                    <Label htmlFor="frequencyValue">Every</Label>
                    <Input
                      id="frequencyValue"
                      type="number"
                      min="1" // minimum 1 day/week/month/year
                      value={formData.frequencyValue} // controlled input
                      onChange={(e) => setFormData(prev => ({ ...prev, frequencyValue: e.target.value }))} // update form state
                      required
                    />
                  </div>
                </div>

                {/* date range row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* start date input */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate} // controlled input
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} // update form state
                      required
                    />
                  </div>

                  {/* optional end date input */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate} // controlled input
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} // update form state
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* form action buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1"> {/* submit form */}
                    Create Recurring Transaction
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)} // close dialog without saving
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Recurring Transactions Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Repeat className="w-5 h-5" /> {/* repeat icon */}
            <span>Active Recurring Transactions ({activeTransactions.length})</span> {/* show count */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"> {/* transaction row */}
                {/* left side - icon and details */}
                <div className="flex items-center space-x-4">
                  {/* transaction type icon with color coding */}
                  <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}> {/* green for income, red for expense */}
                    <DollarSign className={`w-4 h-4 ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name}</p> {/* transaction name */}
                    <p className="text-sm text-muted-foreground">
                      ${transaction.amount.toFixed(2)} • {transaction.category} • {getFrequencyDisplay(transaction.frequency, transaction.frequencyValue)} {/* amount, category, frequency */}
                    </p>
                    {/* next occurrence information */}
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" /> {/* clock icon */}
                      <span className="text-xs text-muted-foreground">
                        Next: {format(new Date(transaction.nextOccurrence), 'MMM dd, yyyy')} ({getNextOccurrenceDisplay(transaction.nextOccurrence)}) {/* formatted next occurrence date */}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* right side - controls */}
                <div className="flex items-center space-x-2">
                  {/* active/inactive toggle */}
                  <Switch
                    checked={transaction.isActive} // current active state
                    onCheckedChange={(checked) => handleToggleActive(transaction.id, checked)} // toggle active status
                  />
                  {/* edit button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(transaction)} // edit this transaction
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {/* delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id, transaction.name)} // delete with confirmation
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* empty state for active transactions */}
            {activeTransactions.length === 0 && (
              <div className="text-center py-8">
                <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-2" /> {/* large repeat icon */}
                <p className="text-muted-foreground">No active recurring transactions</p>
                <p className="text-sm text-muted-foreground">Create one to automate your regular income and expenses</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Recurring Transactions Section - only show if there are inactive transactions */}
      {inactiveTransactions.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pause className="w-5 h-5" /> {/* pause icon */}
              <span>Inactive Recurring Transactions ({inactiveTransactions.length})</span> {/* show count */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60"> {/* dimmed appearance for inactive */}
                  {/* left side - icon and details */}
                  <div className="flex items-center space-x-4">
                    {/* muted icon for inactive transactions */}
                    <div className="p-2 rounded-lg bg-muted">
                      <DollarSign className="w-4 h-4 text-muted-foreground" /> {/* gray icon */}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p> {/* transaction name */}
                      <p className="text-sm text-muted-foreground">
                        ${transaction.amount.toFixed(2)} • {transaction.category} • {getFrequencyDisplay(transaction.frequency, transaction.frequencyValue)} {/* amount, category, frequency */}
                      </p>
                    </div>
                  </div>
                  
                  {/* right side - controls */}
                  <div className="flex items-center space-x-2">
                    {/* active/inactive toggle */}
                    <Switch
                      checked={transaction.isActive} // current active state (false for inactive)
                      onCheckedChange={(checked) => handleToggleActive(transaction.id, checked)} // toggle active status
                    />
                    {/* edit button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)} // edit this transaction
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {/* delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id, transaction.name)} // delete with confirmation
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog - opens when editingTransaction is not null */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Recurring Transaction</DialogTitle>
            <DialogDescription>
              Update your recurring transaction details.
            </DialogDescription>
          </DialogHeader>
          {/* recurring transaction editing form - same form as create but pre-filled */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Same form fields as create dialog - form reuses the same state and handler */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Monthly Salary, Weekly Groceries"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'income' | 'expense') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => cat.type === formData.type)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-frequency">Frequency *</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-frequencyValue">Every</Label>
                <Input
                  id="edit-frequencyValue"
                  type="number"
                  min="1"
                  value={formData.frequencyValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequencyValue: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Recurring Transaction
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingTransaction(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}