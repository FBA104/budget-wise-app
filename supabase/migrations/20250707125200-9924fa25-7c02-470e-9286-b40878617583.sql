-- Create categories table for custom user categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT NOT NULL DEFAULT 'DollarSign',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (auth.uid() = user_id AND is_default = false);

-- Insert default categories for all users (these will be visible to everyone)
-- We'll create a trigger to automatically add default categories for new users

-- Create function to insert default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default expense categories
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (NEW.id, 'Food & Dining', 'expense', '#ef4444', 'UtensilsCrossed', true),
    (NEW.id, 'Transportation', 'expense', '#f97316', 'Car', true),
    (NEW.id, 'Shopping', 'expense', '#eab308', 'ShoppingBag', true),
    (NEW.id, 'Entertainment', 'expense', '#a855f7', 'Film', true),
    (NEW.id, 'Bills & Utilities', 'expense', '#06b6d4', 'Receipt', true),
    (NEW.id, 'Healthcare', 'expense', '#ec4899', 'Heart', true);
  
  -- Insert default income categories  
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (NEW.id, 'Salary', 'income', '#10b981', 'Briefcase', true),
    (NEW.id, 'Freelance', 'income', '#3b82f6', 'Laptop', true),
    (NEW.id, 'Investment', 'income', '#8b5cf6', 'TrendingUp', true),
    (NEW.id, 'Other Income', 'income', '#6366f1', 'DollarSign', true);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default categories for new users
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories_for_user();