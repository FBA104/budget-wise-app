/**
 * Utils test suite
 * Tests utility functions used throughout the application
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  cn, 
  formatCurrency, 
  formatDate, 
  calculatePercentage, 
  truncateText, 
  generateId, 
  isValidEmail, 
  debounce 
} from '../utils';

describe('cn utility function', () => {
  it('should combine multiple class names', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle conditional classes with clsx', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
    expect(result).toBe('base-class conditional-class');
  });

  it('should merge conflicting Tailwind classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with conditional keys', () => {
    const result = cn({
      'active': true,
      'inactive': false,
      'base-class': true
    });
    expect(result).toBe('active base-class');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle null and undefined values', () => {
    const result = cn('valid-class', null, undefined, 'another-class');
    expect(result).toBe('valid-class another-class');
  });

  it('should merge complex Tailwind conflicts', () => {
    const result = cn(
      'px-4 py-2 bg-red-500 text-white',
      'bg-blue-600 px-6'
    );
    expect(result).toBe('py-2 text-white bg-blue-600 px-6');
  });
});

describe('formatCurrency function', () => {
  it('should format positive amounts correctly', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('should format negative amounts correctly', () => {
    const result = formatCurrency(-1234.56);
    expect(result).toBe('-$1,234.56');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  it('should handle different currencies', () => {
    const result = formatCurrency(1234.56, 'EUR');
    expect(result).toBe('€1,234.56');
  });

  it('should handle whole numbers', () => {
    const result = formatCurrency(1000);
    expect(result).toBe('$1,000.00');
  });
});

describe('formatDate function', () => {
  it('should format string dates correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('Jan 15, 2024');
  });

  it('should format Date objects correctly', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toBe('Jan 15, 2024');
  });

  it('should handle different months', () => {
    const result = formatDate('2024-12-25');
    expect(result).toBe('Dec 25, 2024');
  });
});

describe('calculatePercentage function', () => {
  it('should calculate percentage correctly', () => {
    const result = calculatePercentage(25, 100);
    expect(result).toBe(25);
  });

  it('should handle zero total safely', () => {
    const result = calculatePercentage(50, 0);
    expect(result).toBe(0);
  });

  it('should round to nearest integer', () => {
    const result = calculatePercentage(33.333, 100);
    expect(result).toBe(33);
  });

  it('should handle percentages over 100', () => {
    const result = calculatePercentage(150, 100);
    expect(result).toBe(150);
  });

  it('should handle zero current value', () => {
    const result = calculatePercentage(0, 100);
    expect(result).toBe(0);
  });
});

describe('truncateText function', () => {
  it('should truncate long text', () => {
    const result = truncateText('This is a very long text that should be truncated', 20);
    expect(result).toBe('This is a very long...');
  });

  it('should not truncate short text', () => {
    const result = truncateText('Short text', 20);
    expect(result).toBe('Short text');
  });

  it('should handle exact length', () => {
    const result = truncateText('Exactly twenty chars', 20);
    expect(result).toBe('Exactly twenty chars');
  });

  it('should handle empty string', () => {
    const result = truncateText('', 20);
    expect(result).toBe('');
  });

  it('should trim whitespace before adding ellipsis', () => {
    const result = truncateText('Text with spaces   ', 10);
    expect(result).toBe('Text with...');
  });
});

describe('generateId function', () => {
  it('should generate string IDs', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs with consistent length', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1.length).toBe(id2.length);
  });
});

describe('isValidEmail function', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('user123@test-domain.org')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user.domain.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidEmail('user with spaces@domain.com')).toBe(false);
    expect(isValidEmail('user@domain..com')).toBe(false);
    expect(isValidEmail('user@@domain.com')).toBe(false);
  });
});

describe('debounce function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should cancel previous calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');
    
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should handle multiple arguments', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2', 123);
    vi.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });
});