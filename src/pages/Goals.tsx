/**
 * Goals - track savings goals and progress
 */

import { useState } from 'react';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Goal } from '@/types/budget';
import { Plus, Target, Edit, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useBudgetData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: '',
  });

  // handle form submit for create/edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // check required fields
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // convert form strings to proper types
    const goalData = {
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount), // string -> number
      currentAmount: parseFloat(formData.currentAmount) || 0, // default to 0
      deadline: formData.deadline,
      description: formData.description,
    };

    if (editingGoal) {
      // update existing goal
      updateGoal(editingGoal.id, goalData);
      toast({ title: 'Success', description: 'Goal updated successfully!' });
      setEditingGoal(null);
    } else {
      // create new goal
      addGoal(goalData);
      toast({ title: 'Success', description: 'Goal created successfully!' });
      setIsAddDialogOpen(false);
    }

    // clear form
    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      description: '',
    });
  };

  /**
   * Initiates goal editing by populating the form with existing goal data
   * 
   * Sets the component to edit mode and pre-fills the form with the selected
   * goal's current values for user modification.
   * 
   * @param goal - The goal object to be edited
   */
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      description: goal.description,
    });
  };

  /**
   * Handles goal deletion with user confirmation
   * 
   * Prompts the user for confirmation before permanently deleting a goal.
   * Shows success notification upon successful deletion.
   * 
   * @param id - The unique identifier of the goal to delete
   */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
      toast({
        title: 'Success',
        description: 'Goal deleted successfully!',
      });
    }
  };

  // add money to a goal (prevents overfunding)
  const handleAddFunds = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      // cap at target amount to prevent overfunding
      updateGoal(goalId, { currentAmount: Math.min(newAmount, goal.targetAmount) });
      toast({
        title: 'Success',
        description: `$${amount.toFixed(2)} added to ${goal.title}!`,
      });
    }
  };

  // determine goal status and color based on progress/deadline
  const getGoalStatus = (goal: Goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100; // completion %
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const isOverdue = deadline < now && percentage < 100; // past deadline & incomplete
    
    if (percentage >= 100) return { status: 'completed', color: 'success' }; // done!
    if (isOverdue) return { status: 'overdue', color: 'destructive' }; // missed deadline
    if (percentage >= 75) return { status: 'on-track', color: 'success' }; // almost there
    if (percentage >= 50) return { status: 'progress', color: 'warning' }; // halfway
    return { status: 'starting', color: 'muted' }; // just started
  };

  // sum up all goal amounts for overview stats
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground">
            Set and track your financial objectives
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a financial target and track your progress toward achieving it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Emergency Fund, Vacation"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal and why it's important..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  Create Goal
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium">Total Goals</span>
            </div>
            <p className="text-2xl font-bold mt-2">{goals.length}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{completedGoals}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-warning" />
              <span className="font-medium">Total Target</span>
            </div>
            <p className="text-2xl font-bold mt-2">${totalTargetAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="font-medium">Total Saved</span>
            </div>
            <p className="text-2xl font-bold mt-2">${totalCurrentAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Goals ({goals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            // show empty state when no goals exist
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" /> {/* large target icon */}
              <p className="text-muted-foreground mb-2">No goals created yet</p>
              <p className="text-sm text-muted-foreground">
                Start by creating your first financial goal
              </p>
            </div>
          ) : (
            // render goal cards
            <div className="space-y-6">
              {goals.map((goal) => {
                // calculate values for this goal
                const { status, color } = getGoalStatus(goal); // get status color/text
                const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100); // cap at 100%
                const remaining = goal.targetAmount - goal.currentAmount; // money left to reach goal
                const deadline = new Date(goal.deadline); // convert string to date
                const isOverdue = deadline < new Date() && percentage < 100; // check if past deadline
                
                return (
                  <div key={goal.id} className="p-6 border rounded-lg space-y-4"> {/* goal card container */}
                    {/* header row with title, status badge, and action buttons */}
                    <div className="flex items-start justify-between">
                      {/* left side - goal info */}
                      <div className="flex-1">
                        {/* title and status badge row */}
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">{goal.title}</h3> {/* goal name */}
                          {/* status badge with dynamic color */}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}/10 text-${color}`}>
                            {status.replace('-', ' ')} {/* convert "on-track" to "on track" */}
                          </div>
                        </div>
                        
                        {/* optional description */}
                        {goal.description && (
                          <p className="text-muted-foreground mb-3">{goal.description}</p>
                        )}
                        
                        {/* deadline info */}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" /> {/* calendar icon */}
                            {/* deadline text - red if overdue */}
                            <span className={isOverdue ? 'text-destructive' : ''}>
                              {formatDistanceToNow(deadline, { addSuffix: true })} {/* "in 2 months" or "2 days ago" */}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* right side - action buttons */}
                      <div className="flex items-center space-x-2">
                        {/* edit button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)} // populate form with goal data
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {/* delete button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal.id)} // delete with confirmation
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* progress section */}
                    <div className="space-y-2">
                      {/* progress header with current/target amounts */}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">
                          ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)} {/* show amounts with 2 decimals */}
                        </span>
                      </div>
                      
                      {/* progress bar */}
                      <Progress value={percentage} className="h-3" /> {/* percentage fills the bar */}
                      
                      {/* progress details */}
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(0)}% completed</span> {/* round percentage to whole number */}
                        <span>${remaining.toFixed(2)} remaining</span> {/* money left to reach goal */}
                      </div>
                    </div>
                    
                    {/* quick add buttons - only show if goal not completed */}
                    {percentage < 100 && (
                      <div className="flex space-x-2">
                        {/* preset amount buttons */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFunds(goal.id, 50)} // add $50 to goal
                        >
                          Add $50
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFunds(goal.id, 100)} // add $100 to goal
                        >
                          Add $100
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const amount = prompt('Enter amount to add:'); // ask user for custom amount
                            if (amount && !isNaN(parseFloat(amount))) { // validate input is a number
                              handleAddFunds(goal.id, parseFloat(amount)); // add the custom amount
                            }
                          }}
                        >
                          Custom Amount
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your financial goal details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* goal title input */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Goal Title *</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Emergency Fund, Vacation"
                value={formData.title} // pre-filled with existing title
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} // update form state
                required
              />
            </div>

            {/* target amount input with dollar sign */}
            <div className="space-y-2">
              <Label htmlFor="edit-targetAmount">Target Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">$</span> {/* dollar sign prefix */}
                <Input
                  id="edit-targetAmount"
                  type="number"
                  step="0.01" // allow cents
                  min="0" // no negative amounts
                  placeholder="0.00"
                  value={formData.targetAmount} // pre-filled with existing amount
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))} // update form state
                  className="pl-8" // pad left for dollar sign
                  required
                />
              </div>
            </div>

            {/* current amount input (optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-currentAmount">Current Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">$</span> {/* dollar sign prefix */}
                <Input
                  id="edit-currentAmount"
                  type="number"
                  step="0.01" // allow cents
                  min="0" // no negative amounts
                  placeholder="0.00"
                  value={formData.currentAmount} // pre-filled with existing amount
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))} // update form state
                  className="pl-8" // pad left for dollar sign
                />
              </div>
            </div>

            {/* deadline date picker */}
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Target Date *</Label>
              <Input
                id="edit-deadline"
                type="date" // date picker input
                value={formData.deadline} // pre-filled with existing date
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))} // update form state
                required
              />
            </div>

            {/* description textarea (optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe your goal and why it's important..."
                value={formData.description} // pre-filled with existing description
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} // update form state
                rows={3} // 3 rows tall
              />
            </div>

            {/* action buttons */}
            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1"> {/* submit button takes full width */}
                Update Goal
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingGoal(null)} // close dialog without saving
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