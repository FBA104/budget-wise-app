-- Insert missing default categories for existing users who don't have them
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) 
SELECT 
  'afdc4f92-05c9-41da-8cf0-6b0adc63edae',
  category_data.name,
  category_data.type,
  category_data.color,
  category_data.icon,
  true
FROM (
  VALUES 
    ('Food & Dining', 'expense', '#ef4444', 'UtensilsCrossed'),
    ('Transportation', 'expense', '#f97316', 'Car'),
    ('Shopping', 'expense', '#eab308', 'ShoppingBag'),
    ('Entertainment', 'expense', '#a855f7', 'Film'),
    ('Bills & Utilities', 'expense', '#06b6d4', 'Receipt'),
    ('Healthcare', 'expense', '#ec4899', 'Heart'),
    ('Salary', 'income', '#10b981', 'Briefcase'),
    ('Freelance', 'income', '#3b82f6', 'Laptop'),
    ('Investment', 'income', '#8b5cf6', 'TrendingUp'),
    ('Other Income', 'income', '#6366f1', 'DollarSign')
) AS category_data(name, type, color, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE user_id = 'afdc4f92-05c9-41da-8cf0-6b0adc63edae' 
  AND name = category_data.name
);