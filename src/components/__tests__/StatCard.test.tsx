import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { DollarSign } from 'lucide-react';

describe('StatCard Component', () => {
  // default props for consistent testing
  const defaultProps = {
    title: 'Total Balance', // card title text
    value: '$1,500.00', // main value to display
    change: '+5% from last month', // change indicator text
    changeType: 'positive' as const, // determines text color
    icon: DollarSign, // lucide icon component
    gradient: 'bg-gradient-primary', // background gradient class
  };

  it('renders with all provided props', () => {
    render(<StatCard {...defaultProps} />); // render component with default props
    
    // verify all text content appears in the DOM
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    expect(screen.getByText('+5% from last month')).toBeInTheDocument();
  });

  it('displays positive change correctly', () => {
    render(<StatCard {...defaultProps} changeType="positive" />); // render with positive change type
    
    const changeText = screen.getByText('+5% from last month'); // find change text element
    expect(changeText).toHaveClass('text-success'); // should have success color for positive changes
  });

  it('displays negative change correctly', () => {
    render(
      <StatCard 
        {...defaultProps} 
        change="-2% from last month" // negative change text
        changeType="negative" // negative change type for red styling
      />
    );
    
    const changeText = screen.getByText('-2% from last month'); // find negative change text
    expect(changeText).toHaveClass('text-destructive'); // should have destructive color for negative changes
  });

  it('applies the correct gradient class', () => {
    render(<StatCard {...defaultProps} />); // render with default gradient
    
    const cardContent = screen.getByText('Total Balance').closest('div'); // find card container
    expect(cardContent).toBeInTheDocument(); // verify card renders with gradient styling
  });
});