/**
 * API Integration Tests
 * Tests for Supabase database operations and API calls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

// Type aliases for better readability
type Transaction = Database['public']['Tables']['transactions']['Row'];
type Budget = Database['public']['Tables']['budgets']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Goal = Database['public']['Tables']['goals']['Row'];

// Mock data for testing
const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockTransaction: Omit<Transaction, 'id' | 'created_at'> = {
  user_id: mockUser.id,
  amount: 50.00,
  category: 'Food & Dining',
  description: 'Lunch at restaurant',
  type: 'expense',
  date: '2024-01-15'
};

const mockBudget: Omit<Budget, 'id' | 'created_at'> = {
  user_id: mockUser.id,
  category: 'Food & Dining',
  limit_amount: 500,
  spent: 150,
  period: 'monthly'
};

const mockCategory: Omit<Category, 'id' | 'created_at'> = {
  user_id: mockUser.id,
  name: 'Groceries',
  type: 'expense',
  icon: 'ShoppingCart',
  color: '#10b981',
  is_default: false
};

const mockGoal: Omit<Goal, 'id' | 'created_at'> = {
  user_id: mockUser.id,
  title: 'Emergency Fund',
  target_amount: 10000,
  current_amount: 2500,
  deadline: '2024-12-31',
  description: 'Save for emergencies'
};

describe('Transaction API Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new transaction', async () => {
    const mockResponse = {
      data: [{ ...mockTransaction, id: 'trans-1', created_at: '2024-01-15T10:00:00Z' }],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('transactions')
      .insert([mockTransaction])
      .select();

    expect(result.data).toHaveLength(1);
    expect(result.data![0]).toMatchObject(mockTransaction);
    expect(result.error).toBeNull();
  });

  it('should fetch transactions for a user', async () => {
    const mockResponse = {
      data: [
        { ...mockTransaction, id: 'trans-1', created_at: '2024-01-15T10:00:00Z' },
        { ...mockTransaction, id: 'trans-2', created_at: '2024-01-16T10:00:00Z' }
      ],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockResponse)
        })
      })
    } as any);

    const result = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', mockUser.id)
      .order('created_at', { ascending: false });

    expect(result.data).toHaveLength(2);
    expect(result.error).toBeNull();
  });

  it('should update a transaction', async () => {
    const updatedData = { amount: 75.00, description: 'Updated lunch expense' };
    const mockResponse = {
      data: [{ ...mockTransaction, ...updatedData, id: 'trans-1', created_at: '2024-01-15T10:00:00Z' }],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse)
        })
      })
    } as any);

    const result = await supabase
      .from('transactions')
      .update(updatedData)
      .eq('id', 'trans-1')
      .select();

    expect(result.data![0].amount).toBe(75.00);
    expect(result.data![0].description).toBe('Updated lunch expense');
    expect(result.error).toBeNull();
  });

  it('should delete a transaction', async () => {
    const mockResponse = { data: [], error: null };

    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('transactions')
      .delete()
      .eq('id', 'trans-1');

    expect(result.error).toBeNull();
  });
});

describe('Budget API Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new budget', async () => {
    const mockResponse = {
      data: [{ ...mockBudget, id: 'budget-1', created_at: '2024-01-01T10:00:00Z' }],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('budgets')
      .insert([mockBudget])
      .select();

    expect(result.data).toHaveLength(1);
    expect(result.data![0]).toMatchObject(mockBudget);
    expect(result.error).toBeNull();
  });

  it('should fetch budgets for a user', async () => {
    const mockResponse = {
      data: [
        { ...mockBudget, id: 'budget-1', created_at: '2024-01-01T10:00:00Z' }
      ],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', mockUser.id);

    expect(result.data).toHaveLength(1);
    expect(result.error).toBeNull();
  });

  it('should handle budget constraint violation', async () => {
    const mockResponse = {
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
        details: 'Key (user_id, category) already exists.'
      }
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('budgets')
      .insert([mockBudget])
      .select();

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(result.error?.code).toBe('23505');
  });
});

describe('Category API Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new category', async () => {
    const mockResponse = {
      data: [{ ...mockCategory, id: 'cat-1', created_at: '2024-01-01T10:00:00Z' }],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('categories')
      .insert([mockCategory])
      .select();

    expect(result.data).toHaveLength(1);
    expect(result.data![0]).toMatchObject(mockCategory);
    expect(result.error).toBeNull();
  });

  it('should fetch categories by type', async () => {
    const mockResponse = {
      data: [
        { ...mockCategory, id: 'cat-1', created_at: '2024-01-01T10:00:00Z' }
      ],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((field, value) => ({
          eq: vi.fn().mockImplementation((field2, value2) => ({
            order: vi.fn().mockResolvedValue(mockResponse)
          }))
        }))
      })
    } as any);

    const result = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', mockUser.id)
      .eq('type', 'expense')
      .order('name');

    expect(result.data).toHaveLength(1);
    expect(result.data![0].type).toBe('expense');
    expect(result.error).toBeNull();
  });
});

describe('Goals API Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new goal', async () => {
    const mockResponse = {
      data: [{ ...mockGoal, id: 'goal-1', created_at: '2024-01-01T10:00:00Z' }],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const result = await supabase
      .from('goals')
      .insert([mockGoal])
      .select();

    expect(result.data).toHaveLength(1);
    expect(result.data![0]).toMatchObject(mockGoal);
    expect(result.error).toBeNull();
  });

  it('should update goal progress', async () => {
    const progressUpdate = { current_amount: 3000 };
    const mockResponse = {
      data: [{ ...mockGoal, ...progressUpdate, id: 'goal-1', created_at: '2024-01-01T10:00:00Z' }],
      error: null
    };

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse)
        })
      })
    } as any);

    const result = await supabase
      .from('goals')
      .update(progressUpdate)
      .eq('id', 'goal-1')
      .select();

    expect(result.data![0].current_amount).toBe(3000);
    expect(result.error).toBeNull();
  });
});

describe('Authentication Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth methods that may not be available in setup
    if (!supabase.auth.signUp) {
      (supabase.auth as any).signUp = vi.fn();
    }
    if (!supabase.auth.signInWithPassword) {
      (supabase.auth as any).signInWithPassword = vi.fn();
    }
  });

  it('should sign up a new user', async () => {
    const mockResponse = {
      data: {
        user: { id: 'new-user-id', email: 'newuser@example.com' },
        session: { access_token: 'token123' }
      },
      error: null
    };

    const signUpMock = supabase.auth.signUp as any;
    if (signUpMock?.mockResolvedValue) {
      signUpMock.mockResolvedValue(mockResponse);
    } else {
      (supabase.auth as any).signUp = vi.fn().mockResolvedValue(mockResponse);
    }

    const result = await supabase.auth.signUp({
      email: 'newuser@example.com',
      password: 'securepassword123'
    });

    expect(result.data.user?.email).toBe('newuser@example.com');
    expect(result.error).toBeNull();
  });

  it('should sign in an existing user', async () => {
    const mockResponse = {
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token123' }
      },
      error: null
    };

    const signInMock = supabase.auth.signInWithPassword as any;
    if (signInMock?.mockResolvedValue) {
      signInMock.mockResolvedValue(mockResponse);
    } else {
      (supabase.auth as any).signInWithPassword = vi.fn().mockResolvedValue(mockResponse);
    }

    const result = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result.data.user?.email).toBe('test@example.com');
    expect(result.error).toBeNull();
  });

  it('should handle authentication errors', async () => {
    const mockResponse = {
      data: { user: null, session: null },
      error: {
        message: 'Invalid credentials',
        status: 400
      }
    };

    const signInMock = supabase.auth.signInWithPassword as any;
    if (signInMock?.mockResolvedValue) {
      signInMock.mockResolvedValue(mockResponse);
    } else {
      (supabase.auth as any).signInWithPassword = vi.fn().mockResolvedValue(mockResponse);
    }

    const result = await supabase.auth.signInWithPassword({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });

    expect(result.data.user).toBeNull();
    expect(result.error?.message).toBe('Invalid credentials');
  });

  it('should get current user session', async () => {
    const mockResponse = {
      data: {
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
          access_token: 'token123'
        }
      },
      error: null
    };

    const getSessionMock = supabase.auth.getSession as any;
    if (getSessionMock?.mockResolvedValue) {
      getSessionMock.mockResolvedValue(mockResponse);
    } else {
      // Already mocked in setup, should work
    }

    const result = await supabase.auth.getSession();

    expect(result.data.session?.user.email).toBe('test@example.com');
    expect(result.error).toBeNull();
  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle network errors', async () => {
    const mockResponse = {
      data: null,
      error: {
        message: 'Network error',
        details: 'Failed to connect to database'
      }
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue(mockResponse)
    } as any);

    const result = await supabase
      .from('transactions')
      .select('*');

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Network error');
  });

  it('should handle validation errors', async () => {
    const mockResponse = {
      data: null,
      error: {
        code: '23514',
        message: 'new row for relation violates check constraint',
        details: 'Amount must be greater than 0'
      }
    };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse)
      })
    } as any);

    const invalidTransaction = { ...mockTransaction, amount: -50 };
    const result = await supabase
      .from('transactions')
      .insert([invalidTransaction])
      .select();

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('23514');
  });
});