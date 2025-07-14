-- Create recurring_transactions table
CREATE TABLE public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  frequency_value INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recurring_transactions
CREATE POLICY "Users can view their own recurring transactions" 
ON public.recurring_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions" 
ON public.recurring_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
ON public.recurring_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
ON public.recurring_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recurring_transactions_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate next occurrence date
CREATE OR REPLACE FUNCTION public.calculate_next_occurrence(
  current_date DATE,
  frequency TEXT,
  frequency_value INTEGER
)
RETURNS DATE AS $$
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      RETURN current_date + (frequency_value || ' days')::INTERVAL;
    WHEN 'weekly' THEN
      RETURN current_date + (frequency_value || ' weeks')::INTERVAL;
    WHEN 'monthly' THEN
      RETURN current_date + (frequency_value || ' months')::INTERVAL;
    WHEN 'yearly' THEN
      RETURN current_date + (frequency_value || ' years')::INTERVAL;
    ELSE
      RETURN current_date;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to process due recurring transactions
CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
RETURNS INTEGER AS $$
DECLARE
  rec RECORD;
  processed_count INTEGER := 0;
BEGIN
  -- Find all active recurring transactions that are due
  FOR rec IN 
    SELECT * FROM public.recurring_transactions 
    WHERE is_active = true 
    AND next_occurrence <= CURRENT_DATE
    AND (end_date IS NULL OR next_occurrence <= end_date)
  LOOP
    -- Create the actual transaction
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      category,
      description,
      date
    ) VALUES (
      rec.user_id,
      rec.type,
      rec.amount,
      rec.category,
      COALESCE(rec.description, rec.name),
      rec.next_occurrence
    );
    
    -- Update the next occurrence date
    UPDATE public.recurring_transactions 
    SET 
      next_occurrence = public.calculate_next_occurrence(
        rec.next_occurrence, 
        rec.frequency, 
        rec.frequency_value
      ),
      updated_at = now()
    WHERE id = rec.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;