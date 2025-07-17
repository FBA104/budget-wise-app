/**
 * utils - utility functions
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// utility function to combine and merge tailwind css classes
// uses clsx to handle conditional classes and twMerge to resolve conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // merge classes, with later classes overriding earlier ones
}

// format currency amounts with proper locale formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// format dates to readable string
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// calculate percentage with safe division
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

// truncate text to specified length with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// generate random ID for temporary use
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// validate email format
export function isValidEmail(email: string): boolean {
  // More comprehensive email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // Additional checks for edge cases
  if (!email || typeof email !== 'string') return false
  if (email.includes('..')) return false // consecutive dots
  if (email.includes('@@')) return false // consecutive @ symbols
  if (email.includes(' ')) return false // spaces
  
  return emailRegex.test(email)
}

// debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
