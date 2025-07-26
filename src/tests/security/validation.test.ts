/**
 * Input Validation Test Suite
 * Tests for comprehensive input validation and sanitization
 */

import { describe, it, expect } from 'vitest';

// Validation utilities
export const validators = {
  email: (email: string): { valid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    if (email.length > 254) {
      return { valid: false, error: 'Email is too long' };
    }

    if (email.includes('..')) {
      return { valid: false, error: 'Email contains consecutive dots' };
    }

    if (email.includes(' ')) {
      return { valid: false, error: 'Email cannot contain spaces' };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  },

  password: (password: string): { valid: boolean; error?: string; strength?: string } => {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { valid: false, error: 'Password is too long' };
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 'weak';
    let strengthScore = 0;

    if (hasLowerCase) strengthScore++;
    if (hasUpperCase) strengthScore++;
    if (hasNumbers) strengthScore++;
    if (hasSpecialChar) strengthScore++;

    if (strengthScore >= 3) strength = 'medium';
    if (strengthScore === 4 && password.length >= 12) strength = 'strong';

    if (strengthScore < 3) {
      return { 
        valid: false, 
        error: 'Password must contain at least 3 of: lowercase, uppercase, numbers, special characters',
        strength 
      };
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'letmein', 'welcome'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, error: 'Password is too common', strength };
    }

    return { valid: true, strength };
  },

  amount: (amount: string | number): { valid: boolean; error?: string; parsedValue?: number } => {
    if (amount === '' || amount === null || amount === undefined) {
      return { valid: false, error: 'Amount is required' };
    }

    let numericValue: number;

    if (typeof amount === 'string') {
      // Remove currency symbols and spaces
      const cleanAmount = amount.replace(/[$€£¥,\s]/g, '');
      
      if (cleanAmount === '') {
        return { valid: false, error: 'Amount cannot be empty' };
      }

      // Check for valid number format
      if (!/^-?\d*\.?\d+$/.test(cleanAmount)) {
        return { valid: false, error: 'Invalid amount format' };
      }

      numericValue = parseFloat(cleanAmount);
    } else {
      numericValue = amount;
    }

    if (isNaN(numericValue) || !isFinite(numericValue)) {
      return { valid: false, error: 'Amount must be a valid number' };
    }

    if (numericValue < -999999999.99) {
      return { valid: false, error: 'Amount is too small' };
    }

    if (numericValue > 999999999.99) {
      return { valid: false, error: 'Amount is too large' };
    }

    // Check decimal places
    const decimalPlaces = (numericValue.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
    }

    return { valid: true, parsedValue: Math.round(numericValue * 100) / 100 };
  },

  date: (date: string): { valid: boolean; error?: string; parsedDate?: Date } => {
    if (!date || typeof date !== 'string') {
      return { valid: false, error: 'Date is required' };
    }

    // Check for valid date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
    }

    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      return { valid: false, error: 'Invalid date' };
    }
    
    // Check if the date was actually parsed correctly (e.g., 2024-02-30 becomes 2024-03-01)
    const [year, month, day] = date.split('-').map(Number);
    if (parsedDate.getFullYear() !== year || 
        parsedDate.getMonth() !== month - 1 || 
        parsedDate.getDate() !== day) {
      return { valid: false, error: 'Invalid date' };
    }

    // Check if date is too far in the past or future
    const minDate = new Date('1900-01-01');
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);

    if (parsedDate < minDate) {
      return { valid: false, error: 'Date is too far in the past' };
    }

    if (parsedDate > maxDate) {
      return { valid: false, error: 'Date is too far in the future' };
    }

    return { valid: true, parsedDate };
  },

  text: (text: string, options: { maxLength?: number; minLength?: number; allowEmpty?: boolean } = {}): { valid: boolean; error?: string } => {
    const { maxLength = 1000, minLength = 0, allowEmpty = false } = options;

    if (!text || typeof text !== 'string') {
      if (allowEmpty) return { valid: true };
      return { valid: false, error: 'Text is required' };
    }

    if (!allowEmpty && text.trim().length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }

    if (text.length < minLength) {
      return { valid: false, error: `Text must be at least ${minLength} characters long` };
    }

    if (text.length > maxLength) {
      return { valid: false, error: `Text cannot exceed ${maxLength} characters` };
    }

    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:(?!image\/)/gi,
      /vbscript:/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        return { valid: false, error: 'Text contains potentially dangerous content' };
      }
    }

    return { valid: true };
  },

  category: (category: string, allowedCategories: string[]): { valid: boolean; error?: string } => {
    if (!category || typeof category !== 'string') {
      return { valid: false, error: 'Category is required' };
    }

    if (!allowedCategories.includes(category)) {
      return { valid: false, error: 'Invalid category selected' };
    }

    return { valid: true };
  },

  url: (url: string): { valid: boolean; error?: string } => {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
      }

      // Prevent localhost and private IPs in production
      const hostname = urlObj.hostname.toLowerCase();
      const privateIPPatterns = [
        /^localhost$/,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/
      ];

      if (privateIPPatterns.some(pattern => pattern.test(hostname))) {
        return { valid: false, error: 'Private and local URLs are not allowed' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
};

// Sanitization utilities
export const sanitizers = {
  text: (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;') // Escape ampersands
      .trim();
  },

  html: (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    
    return html.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  },

  filename: (filename: string): string => {
    if (!filename || typeof filename !== 'string') return '';
    
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dots, underscores, hyphens
      .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .substring(0, 255); // Limit length
  },

  amount: (amount: string): string => {
    if (!amount || typeof amount !== 'string') return '';
    
    return amount
      .replace(/[^0-9.-]/g, '') // Only allow numbers, dots, and minus
      .replace(/^(-?)(.*)/, (_, sign, rest) => {
        // Ensure only one minus sign at the beginning
        return sign + rest.replace(/-/g, '');
      })
      .replace(/\.(?=.*\.)/g, ''); // Remove all but the last dot
  }
};

describe('Input Validation Tests', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co'
      ];

      validEmails.forEach(email => {
        const result = validators.email(email);
        expect(result.valid, `Email ${email} should be valid`).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..double.dot@example.com',
        'user with space@example.com',
        'user@example',
        '',
        'a'.repeat(255) + '@example.com'
      ];

      invalidEmails.forEach(email => {
        const result = validators.email(email);
        expect(result.valid, `Email ${email} should be invalid`).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyStr0ng@Password',
        'C0mpl3x&P@ssw0rd'
      ];

      strongPasswords.forEach(password => {
        const result = validators.password(password);
        expect(result.valid, `Password ${password} should be valid`).toBe(true);
        expect(result.strength).toBeDefined();
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'password',
        'ALLUPPERCASE',
        'alllowercase',
        '12345678',
        'nouppercase123',
        'a'.repeat(129) // Too long
      ];

      weakPasswords.forEach(password => {
        const result = validators.password(password);
        expect(result.valid, `Password ${password} should be invalid`).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should assess password strength correctly', () => {
      const result = validators.password('VeryStrong123!');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
    });
  });

  describe('Amount Validation', () => {
    it('should validate correct amount formats', () => {
      const validAmounts = [
        '100',
        '100.50',
        '0.01',
        '$1,234.56',
        '€500.00',
        1000,
        0.5,
        -50.25
      ];

      validAmounts.forEach(amount => {
        const result = validators.amount(amount);
        expect(result.valid, `Amount ${amount} should be valid`).toBe(true);
        expect(result.parsedValue).toBeDefined();
      });
    });

    it('should reject invalid amount formats', () => {
      const invalidAmounts = [
        'abc',
        '12.345', // Too many decimal places
        '',
        '999999999999', // Too large
        'NaN',
        Infinity,
        '12.34.56'
      ];

      invalidAmounts.forEach(amount => {
        const result = validators.amount(amount);
        expect(result.valid, `Amount ${amount} should be invalid`).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Date Validation', () => {
    it('should validate correct date formats', () => {
      const validDates = [
        '2024-01-15',
        '2023-12-31',
        '2025-06-30'
      ];

      validDates.forEach(date => {
        const result = validators.date(date);
        expect(result.valid, `Date ${date} should be valid`).toBe(true);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });
    });

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '15-01-2024', // Wrong format
        '2024/01/15', // Wrong format
        '2024-13-01', // Invalid month
        '2024-02-30', // Invalid day
        '1899-01-01', // Too far in past
        '2035-01-01', // Too far in future
        '',
        'not-a-date'
      ];

      invalidDates.forEach(date => {
        const result = validators.date(date);
        expect(result.valid, `Date ${date} should be invalid`).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Text Validation', () => {
    it('should validate safe text content', () => {
      const safeTexts = [
        'Normal text content',
        'Text with numbers 123',
        'Text with special chars: !@#$%',
        ''
      ];

      safeTexts.forEach(text => {
        const result = validators.text(text, { allowEmpty: true });
        expect(result.valid, `Text "${text}" should be valid`).toBe(true);
      });
    });

    it('should reject dangerous text content', () => {
      const dangerousTexts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onclick="malicious()"',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")'
      ];

      dangerousTexts.forEach(text => {
        const result = validators.text(text);
        expect(result.valid, `Text "${text}" should be invalid`).toBe(false);
        expect(result.error).toContain('dangerous');
      });
    });

    it('should enforce length constraints', () => {
      const longText = 'a'.repeat(1001);
      const result = validators.text(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceed');

      const shortResult = validators.text('ab', { minLength: 5 });
      expect(shortResult.valid).toBe(false);
      expect(shortResult.error).toContain('at least');
    });
  });

  describe('Category Validation', () => {
    it('should validate allowed categories', () => {
      const allowedCategories = ['food', 'transport', 'entertainment'];
      
      allowedCategories.forEach(category => {
        const result = validators.category(category, allowedCategories);
        expect(result.valid, `Category ${category} should be valid`).toBe(true);
      });
    });

    it('should reject invalid categories', () => {
      const allowedCategories = ['food', 'transport', 'entertainment'];
      const invalidCategories = ['invalid', 'hacking', ''];

      invalidCategories.forEach(category => {
        const result = validators.category(category, allowedCategories);
        expect(result.valid, `Category ${category} should be invalid`).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('URL Validation', () => {
    it('should validate safe URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test-site.org/path',
        'https://subdomain.example.com/page?param=value'
      ];

      validUrls.forEach(url => {
        const result = validators.url(url);
        expect(result.valid, `URL ${url} should be valid`).toBe(true);
      });
    });

    it('should reject dangerous URLs', () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert(1)</script>',
        'ftp://example.com',
        'file:///etc/passwd',
        'http://localhost:8080',
        'https://127.0.0.1',
        'https://192.168.1.1',
        'invalid-url'
      ];

      dangerousUrls.forEach(url => {
        const result = validators.url(url);
        expect(result.valid, `URL ${url} should be invalid`).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });
});

describe('Input Sanitization Tests', () => {
  describe('Text Sanitization', () => {
    it('should remove dangerous characters from text', () => {
      const dangerousText = '<script>alert("xss")</script>Hello "World"';
      const sanitized = sanitizers.text(dangerousText);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
      expect(sanitized).toContain('Hello World');
    });

    it('should handle empty and invalid inputs', () => {
      expect(sanitizers.text('')).toBe('');
      expect(sanitizers.text(null as any)).toBe('');
      expect(sanitizers.text(undefined as any)).toBe('');
    });
  });

  describe('HTML Sanitization', () => {
    it('should preserve allowed HTML tags', () => {
      const html = '<p>Safe content</p><strong>Bold</strong><script>alert("xss")</script>';
      const sanitized = sanitizers.html(html);
      
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('Filename Sanitization', () => {
    it('should create safe filenames', () => {
      const dangerousFilename = '../../../etc/passwd<script>.txt';
      const sanitized = sanitizers.filename(dangerousFilename);
      
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toMatch(/^[a-zA-Z0-9._-]+$/);
    });

    it('should handle multiple dots correctly', () => {
      const filename = 'file...with...dots.txt';
      const sanitized = sanitizers.filename(filename);
      
      expect(sanitized).toBe('file.with.dots.txt');
    });
  });

  describe('Amount Sanitization', () => {
    it('should clean amount strings', () => {
      const dirtyAmount = '$1,234.56abc';
      const sanitized = sanitizers.amount(dirtyAmount);
      
      expect(sanitized).toBe('1234.56');
    });

    it('should handle negative amounts', () => {
      const negativeAmount = '-$123.45-invalid';
      const sanitized = sanitizers.amount(negativeAmount);
      
      expect(sanitized).toBe('-123.45');
    });

    it('should handle multiple decimal points', () => {
      const multiDecimal = '123.45.67';
      const sanitized = sanitizers.amount(multiDecimal);
      
      expect(sanitized).toBe('12345.67'); // All but the last dot removed
    });
  });
});