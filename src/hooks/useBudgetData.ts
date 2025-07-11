/**
 * useBudgetData - main hook for all financial data operations
 * Manages transactions, budgets, goals, categories, and recurring transactions
 */

import { useState, useEffect } from 'react';
import { Transaction, Budget, Goal, Category, RecurringTransaction } from '@/types/budget';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// main budget data hook
export const useBudgetData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Load transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        if (transactionsError) throw transactionsError;

        // Load budgets
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (budgetsError) throw budgetsError;

        // Load goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (goalsError) throw goalsError;

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (categoriesError) throw categoriesError;

        // Load recurring transactions
        const { data: recurringData, error: recurringError } = await supabase
          .from('recurring_transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (recurringError) throw recurringError;

        // Transform data to match our interface
        setTransactions(transactionsData.map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          amount: Number(t.amount),
          category: t.category,
          description: t.description,
          date: t.date,
          createdAt: t.created_at,
        })));

        setBudgets(budgetsData.map(b => ({
          id: b.id,
          category: b.category,
          limit: Number(b.limit_amount),
          spent: Number(b.spent),
          period: b.period as 'monthly' | 'weekly' | 'yearly',
          createdAt: b.created_at,
        })));

        setGoals(goalsData.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          deadline: g.deadline,
          description: g.description || '',
          createdAt: g.created_at,
        })));

        setCategories(categoriesData.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type as 'income' | 'expense',
          color: c.color,
          icon: c.icon,
          isDefault: c.is_default,
          createdAt: c.created_at,
        })));

        setRecurringTransactions(recurringData.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type as 'income' | 'expense',
          amount: Number(r.amount),
          category: r.category,
          description: r.description,
          frequency: r.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
          frequencyValue: r.frequency_value,
          startDate: r.start_date,
          endDate: r.end_date,
          nextOccurrence: r.next_occurrence,
          isActive: r.is_active,
          createdAt: r.created_at,
        })));

      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Transaction operations
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        type: data.type as 'income' | 'expense',
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
        createdAt: data.created_at,
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Update budget spent amount if it's an expense
      if (transaction.type === 'expense') {
        // Find the current budget for this category
        const currentBudget = budgets.find(b => b.category === transaction.category);
        if (currentBudget) {
          const newSpent = currentBudget.spent + transaction.amount; // add expense to spent amount
          
          // update database
          await supabase
            .from('budgets')
            .update({ spent: newSpent })
            .eq('user_id', user.id)
            .eq('category', transaction.category);

          // update local state
          setBudgets(prev => prev.map(budget => 
            budget.category === transaction.category 
              ? { ...budget, spent: newSpent } // update matching budget
              : budget // keep other budgets unchanged
          ));
        }
      }

      toast({
        title: "Transaction added",
        description: "Transaction has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id); // find transaction to delete
      if (!transaction) return; // exit if not found

      // delete from database
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // remove from local state
      setTransactions(prev => prev.filter(t => t.id !== id));

      // Update budget spent amount if it was an expense
      if (transaction.type === 'expense') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const currentBudget = budgets.find(b => b.category === transaction.category);
          if (currentBudget) {
            // subtract deleted amount from budget spent (don't go below 0)
            const newSpent = Math.max(0, currentBudget.spent - transaction.amount);
            
            // update database
            await supabase
              .from('budgets')
              .update({ spent: newSpent })
              .eq('user_id', user.id)
              .eq('category', transaction.category);

            // update local state
            setBudgets(prev => prev.map(budget => 
              budget.category === transaction.category 
                ? { ...budget, spent: newSpent } // decrease spent amount
                : budget // keep other budgets unchanged
            ));
          }
        }
      }

      toast({
        title: "Transaction deleted",
        description: "Transaction has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Budget operations
  const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // calculate how much has already been spent in this category
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category) // only expenses for this category
        .reduce((sum, t) => sum + t.amount, 0); // sum up all amounts

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: budget.category,
          limit_amount: budget.limit,
          spent,
          period: budget.period,
        })
        .select()
        .single();

      if (error) throw error;

      const newBudget: Budget = {
        id: data.id,
        category: data.category,
        limit: Number(data.limit_amount),
        spent: Number(data.spent),
        period: data.period as 'monthly' | 'weekly' | 'yearly',
        createdAt: data.created_at,
      };

      setBudgets(prev => [newBudget, ...prev]);

      toast({
        title: "Budget added",
        description: "Budget has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding budget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updateData: any = {};
      if (updates.limit !== undefined) updateData.limit_amount = updates.limit;
      if (updates.spent !== undefined) updateData.spent = updates.spent;
      if (updates.period !== undefined) updateData.period = updates.period;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setBudgets(prev => prev.map(budget => 
        budget.id === id ? { ...budget, ...updates } : budget
      ));

      toast({
        title: "Budget updated",
        description: "Budget has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating budget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBudgets(prev => prev.filter(b => b.id !== id));

      toast({
        title: "Budget deleted",
        description: "Budget has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting budget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Goal operations
  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          description: goal.description,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        targetAmount: Number(data.target_amount),
        currentAmount: Number(data.current_amount),
        deadline: data.deadline,
        description: data.description || '',
        createdAt: data.created_at,
      };

      setGoals(prev => [newGoal, ...prev]);

      toast({
        title: "Goal added",
        description: "Goal has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      ));

      toast({
        title: "Goal updated",
        description: "Goal has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));

      toast({
        title: "Goal deleted",
        description: "Goal has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculated values for financial overview
  const totalIncome = transactions
    .filter(t => t.type === 'income') // only income transactions
    .reduce((sum, t) => sum + t.amount, 0); // sum all amounts

  const totalExpenses = transactions
    .filter(t => t.type === 'expense') // only expense transactions
    .reduce((sum, t) => sum + t.amount, 0); // sum all amounts

  const balance = totalIncome - totalExpenses; // net balance (income - expenses)

  // Category operations
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        type: data.type as 'income' | 'expense',
        color: data.color,
        icon: data.icon,
        isDefault: false,
        createdAt: data.created_at,
      };

      setCategories(prev => [...prev, newCategory]);

      toast({
        title: "Category added",
        description: "Category has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.map(category => 
        category.id === id ? { ...category, ...updates } : category
      ));

      toast({
        title: "Category updated",
        description: "Category has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));

      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Import operations
  const importTransactions = async (importedTransactions: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const transaction of importedTransactions) {
        try {
          // Validate required fields
          if (!transaction.type || !transaction.amount || !transaction.category || !transaction.date) {
            errors.push(`Transaction missing required fields: ${JSON.stringify(transaction)}`);
            skipped++;
            continue;
          }

          // Check for duplicates based on amount, date, and description
          const duplicate = transactions.find(t => 
            t.amount === Number(transaction.amount) &&
            t.date === transaction.date &&
            t.description === transaction.description &&
            t.category === transaction.category
          );

          if (duplicate) {
            skipped++;
            continue;
          }

          // Insert the transaction
          const { error } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              type: transaction.type,
              amount: Number(transaction.amount),
              category: transaction.category,
              description: transaction.description || '',
              date: transaction.date,
            });

          if (error) {
            errors.push(`Failed to import transaction: ${error.message}`);
            skipped++;
          } else {
            imported++;
          }
        } catch (error: any) {
          errors.push(`Error processing transaction: ${error.message}`);
          skipped++;
        }
      }

      // Reload data after import
      if (imported > 0) {
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        if (transactionsData) {
          setTransactions(transactionsData.map(t => ({
            id: t.id,
            type: t.type as 'income' | 'expense',
            amount: Number(t.amount),
            category: t.category,
            description: t.description,
            date: t.date,
            createdAt: t.created_at,
          })));
        }
      }

      return { imported, skipped, errors };
    } catch (error: any) {
      throw new Error(`Import failed: ${error.message}`);
    }
  };

  const importCategories = async (importedCategories: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const category of importedCategories) {
        try {
          // Validate required fields
          if (!category.name || !category.type) {
            errors.push(`Category missing required fields: ${JSON.stringify(category)}`);
            skipped++;
            continue;
          }

          // Check for duplicates based on name and type
          const duplicate = categories.find(c => 
            c.name.toLowerCase() === category.name.toLowerCase() &&
            c.type === category.type
          );

          if (duplicate) {
            skipped++;
            continue;
          }

          // Insert the category
          const { error } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: category.name,
              type: category.type,
              color: category.color || '#3b82f6',
              icon: category.icon || 'DollarSign',
              is_default: false,
            });

          if (error) {
            errors.push(`Failed to import category: ${error.message}`);
            skipped++;
          } else {
            imported++;
          }
        } catch (error: any) {
          errors.push(`Error processing category: ${error.message}`);
          skipped++;
        }
      }

      // Reload data after import
      if (imported > 0) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (categoriesData) {
          setCategories(categoriesData.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type as 'income' | 'expense',
            color: c.color,
            icon: c.icon,
            isDefault: c.is_default,
            createdAt: c.created_at,
          })));
        }
      }

      return { imported, skipped, errors };
    } catch (error: any) {
      throw new Error(`Import failed: ${error.message}`);
    }
  };

  const importBudgets = async (importedBudgets: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const budget of importedBudgets) {
        try {
          // Validate required fields
          if (!budget.category || !budget.limit || !budget.period) {
            errors.push(`Budget missing required fields: ${JSON.stringify(budget)}`);
            skipped++;
            continue;
          }

          // Check for duplicates based on category
          const duplicate = budgets.find(b => b.category === budget.category);

          if (duplicate) {
            skipped++;
            continue;
          }

          // Calculate current spent amount for this category
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);

          // Insert the budget
          const { error } = await supabase
            .from('budgets')
            .insert({
              user_id: user.id,
              category: budget.category,
              limit_amount: Number(budget.limit),
              spent,
              period: budget.period,
            });

          if (error) {
            errors.push(`Failed to import budget: ${error.message}`);
            skipped++;
          } else {
            imported++;
          }
        } catch (error: any) {
          errors.push(`Error processing budget: ${error.message}`);
          skipped++;
        }
      }

      // Reload data after import
      if (imported > 0) {
        const { data: budgetsData } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (budgetsData) {
          setBudgets(budgetsData.map(b => ({
            id: b.id,
            category: b.category,
            limit: Number(b.limit_amount),
            spent: Number(b.spent),
            period: b.period as 'monthly' | 'weekly' | 'yearly',
            createdAt: b.created_at,
          })));
        }
      }

      return { imported, skipped, errors };
    } catch (error: any) {
      throw new Error(`Import failed: ${error.message}`);
    }
  };

  const importGoals = async (importedGoals: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const goal of importedGoals) {
        try {
          // Validate required fields
          if (!goal.title || !goal.targetAmount || !goal.deadline) {
            errors.push(`Goal missing required fields: ${JSON.stringify(goal)}`);
            skipped++;
            continue;
          }

          // Check for duplicates based on title
          const duplicate = goals.find(g => g.title.toLowerCase() === goal.title.toLowerCase());

          if (duplicate) {
            skipped++;
            continue;
          }

          // Insert the goal
          const { error } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              title: goal.title,
              target_amount: Number(goal.targetAmount),
              current_amount: Number(goal.currentAmount) || 0,
              deadline: goal.deadline,
              description: goal.description || '',
            });

          if (error) {
            errors.push(`Failed to import goal: ${error.message}`);
            skipped++;
          } else {
            imported++;
          }
        } catch (error: any) {
          errors.push(`Error processing goal: ${error.message}`);
          skipped++;
        }
      }

      // Reload data after import
      if (imported > 0) {
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (goalsData) {
          setGoals(goalsData.map(g => ({
            id: g.id,
            title: g.title,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            deadline: g.deadline,
            description: g.description || '',
            createdAt: g.created_at,
          })));
        }
      }

      return { imported, skipped, errors };
    } catch (error: any) {
      throw new Error(`Import failed: ${error.message}`);
    }
  };

  // Recurring transaction operations
  const addRecurringTransaction = async (recurringTransaction: Omit<RecurringTransaction, 'id' | 'createdAt' | 'nextOccurrence' | 'isActive'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate the next occurrence date
      const { data: nextOccurrence } = await supabase.rpc('calculate_next_occurrence', {
        occurrence_date: recurringTransaction.startDate,
        frequency: recurringTransaction.frequency,
        frequency_value: recurringTransaction.frequencyValue
      });

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          name: recurringTransaction.name,
          type: recurringTransaction.type,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          description: recurringTransaction.description,
          frequency: recurringTransaction.frequency,
          frequency_value: recurringTransaction.frequencyValue,
          start_date: recurringTransaction.startDate,
          end_date: recurringTransaction.endDate,
          next_occurrence: nextOccurrence || recurringTransaction.startDate,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newRecurringTransaction: RecurringTransaction = {
        id: data.id,
        name: data.name,
        type: data.type as 'income' | 'expense',
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        frequency: data.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
        frequencyValue: data.frequency_value,
        startDate: data.start_date,
        endDate: data.end_date,
        nextOccurrence: data.next_occurrence,
        isActive: data.is_active,
        createdAt: data.created_at,
      };

      setRecurringTransactions(prev => [newRecurringTransaction, ...prev]);

      toast({
        title: "Recurring transaction added",
        description: "Recurring transaction has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding recurring transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateRecurringTransaction = async (id: string, updates: Partial<RecurringTransaction>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
      if (updates.frequencyValue !== undefined) updateData.frequency_value = updates.frequencyValue;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('recurring_transactions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setRecurringTransactions(prev => prev.map(rt => 
        rt.id === id ? { ...rt, ...updates } : rt
      ));

      toast({
        title: "Recurring transaction updated",
        description: "Recurring transaction has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating recurring transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));

      toast({
        title: "Recurring transaction deleted",
        description: "Recurring transaction has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting recurring transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const processRecurringTransactions = async () => {
    try {
      const { data: processedCount, error } = await supabase.rpc('process_recurring_transactions');
      
      if (error) throw error;

      // Reload transactions and recurring transactions after processing
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      const { data: recurringData } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData.map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          amount: Number(t.amount),
          category: t.category,
          description: t.description,
          date: t.date,
          createdAt: t.created_at,
        })));
      }

      if (recurringData) {
        setRecurringTransactions(recurringData.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type as 'income' | 'expense',
          amount: Number(r.amount),
          category: r.category,
          description: r.description,
          frequency: r.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
          frequencyValue: r.frequency_value,
          startDate: r.start_date,
          endDate: r.end_date,
          nextOccurrence: r.next_occurrence,
          isActive: r.is_active,
          createdAt: r.created_at,
        })));
      }

      return processedCount || 0;
    } catch (error: any) {
      throw new Error(`Failed to process recurring transactions: ${error.message}`);
    }
  };

  return {
    transactions,
    budgets,
    goals,
    categories,
    recurringTransactions,
    totalIncome,
    totalExpenses,
    balance,
    loading,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addCategory,
    updateCategory,
    deleteCategory,
    importTransactions,
    importCategories,
    importBudgets,
    importGoals,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransactions,
  };
};