-- Seed data for all tables

-- First, create some sample users (these will be created via auth, but we'll use placeholder user IDs)
-- Note: In a real scenario, users would sign up through the auth system
-- For demo purposes, we'll use a sample user ID

-- Insert sample categories (these will be created automatically by the trigger, but let's add some custom ones)
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Groceries', 'expense', '#ef4444', 'ShoppingCart', false),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Gas', 'expense', '#f97316', 'Fuel', false),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Coffee', 'expense', '#8b5cf6', 'Coffee', false),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Side Hustle', 'income', '#10b981', 'DollarSign', false),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Bonus', 'income', '#3b82f6', 'Gift', false);

-- Insert sample transactions (mix of current month and last month)
INSERT INTO public.transactions (user_id, type, amount, category, description, date) VALUES
  -- Current month transactions
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'income', 5000.00, 'Salary', 'Monthly salary', '2025-07-01'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'income', 500.00, 'Side Hustle', 'Freelance project', '2025-07-03'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 1200.00, 'Bills & Utilities', 'Rent payment', '2025-07-01'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 150.00, 'Groceries', 'Weekly grocery shopping', '2025-07-02'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 45.00, 'Gas', 'Gas station fill-up', '2025-07-02'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 25.00, 'Coffee', 'Coffee shop visits', '2025-07-03'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 80.00, 'Entertainment', 'Movie night', '2025-07-04'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 200.00, 'Shopping', 'New clothes', '2025-07-05'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 120.00, 'Food & Dining', 'Restaurant dinner', '2025-07-06'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 60.00, 'Transportation', 'Uber rides', '2025-07-07'),
  
  -- Last month transactions (June 2025)
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'income', 4800.00, 'Salary', 'Monthly salary', '2025-06-01'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'income', 300.00, 'Side Hustle', 'Freelance project', '2025-06-15'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 1200.00, 'Bills & Utilities', 'Rent payment', '2025-06-01'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 180.00, 'Groceries', 'Weekly grocery shopping', '2025-06-05'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 50.00, 'Gas', 'Gas station fill-up', '2025-06-08'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 30.00, 'Coffee', 'Coffee shop visits', '2025-06-10'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 100.00, 'Entertainment', 'Concert tickets', '2025-06-12'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 150.00, 'Shopping', 'Online purchases', '2025-06-18'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 90.00, 'Food & Dining', 'Date night', '2025-06-20'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'expense', 40.00, 'Transportation', 'Bus pass', '2025-06-25');

-- Insert sample budgets
INSERT INTO public.budgets (user_id, category, limit_amount, spent, period) VALUES
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Food & Dining', 400.00, 120.00, 'monthly'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Transportation', 200.00, 60.00, 'monthly'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Shopping', 300.00, 200.00, 'monthly'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Entertainment', 150.00, 80.00, 'monthly'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Groceries', 500.00, 150.00, 'monthly');

-- Insert sample goals
INSERT INTO public.goals (user_id, title, target_amount, current_amount, deadline, description) VALUES
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Emergency Fund', 10000.00, 3500.00, '2025-12-31', 'Build a 6-month emergency fund'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Vacation Fund', 3000.00, 800.00, '2025-09-01', 'Save for summer vacation in Europe'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'New Laptop', 2500.00, 1200.00, '2025-08-15', 'Save for a new MacBook Pro'),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Car Down Payment', 5000.00, 2100.00, '2026-03-01', 'Save for a new car down payment');

-- Insert sample recurring transactions
INSERT INTO public.recurring_transactions (
  user_id, name, type, amount, category, description, frequency, frequency_value, 
  start_date, next_occurrence, is_active
) VALUES
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Monthly Salary', 'income', 5000.00, 'Salary', 'Regular monthly salary', 'monthly', 1, '2025-01-01', '2025-08-01', true),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Rent Payment', 'expense', 1200.00, 'Bills & Utilities', 'Monthly rent payment', 'monthly', 1, '2025-01-01', '2025-08-01', true),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Netflix Subscription', 'expense', 15.99, 'Entertainment', 'Monthly Netflix subscription', 'monthly', 1, '2025-01-15', '2025-08-15', true),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Gym Membership', 'expense', 49.99, 'Healthcare', 'Monthly gym membership', 'monthly', 1, '2025-01-01', '2025-08-01', true),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Coffee Subscription', 'expense', 25.00, 'Coffee', 'Weekly coffee delivery', 'weekly', 1, '2025-07-01', '2025-07-08', true),
  ('afdc4f92-05c9-41da-8cf0-6b0adc63edae', 'Investment Transfer', 'expense', 500.00, 'Investment', 'Monthly investment contribution', 'monthly', 1, '2025-01-01', '2025-08-01', true);