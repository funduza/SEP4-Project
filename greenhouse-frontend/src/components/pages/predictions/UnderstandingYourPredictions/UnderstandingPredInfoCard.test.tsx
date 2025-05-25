import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnderstandingPredInfoCard from './UnderstandingPredInfoCard';
import { ReactNode } from 'react';

// Create effective mocks for Chakra UI components
vi.mock('@chakra-ui/react', () => {
  return {
    Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
    Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
    Heading: ({ children, ...props }: { children: ReactNode }) => <h4 data-testid="chakra-heading" {...props}>{children}</h4>,
    Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  };
});

describe('UnderstandingPredInfoCard', () => {
  // Default props for most tests
  const defaultProps = {
    icon: '🔄',
    title: 'Data Refresh System',
    text: 'Predictions refresh automatically every 30 seconds.',
    themeColor: 'blue',
  };

  it('renders all content correctly', () => {
    const { container } = render(<UnderstandingPredInfoCard {...defaultProps} />);
    
    // Check all content is rendered
    expect(container.innerHTML).toContain('🔄');
    expect(container.innerHTML).toContain('Data Refresh System');
    expect(container.innerHTML).toContain('Predictions refresh automatically every 30 seconds.');
  });

  it('applies the correct theme colors based on themeColor prop', () => {
    const { container } = render(<UnderstandingPredInfoCard {...defaultProps} />);
    
    // Check the theme color is applied correctly
    expect(container.innerHTML).toContain('blue.50');
    expect(container.innerHTML).toContain('blue.100');
    expect(container.innerHTML).toContain('blue.600');
    expect(container.innerHTML).toContain('blue.700');
  });

  it('renders with different theme color', () => {
    const greenProps = {
      ...defaultProps,
      themeColor: 'green',
    };
    
    const { container } = render(<UnderstandingPredInfoCard {...greenProps} />);
    
    // Check the green theme is applied
    expect(container.innerHTML).toContain('green.50');
    expect(container.innerHTML).toContain('green.100');
    expect(container.innerHTML).toContain('green.600');
    expect(container.innerHTML).toContain('green.700');
  });

  it('renders with custom icon', () => {
    const customIconProps = {
      ...defaultProps,
      icon: '🌱',
    };
    
    const { container } = render(<UnderstandingPredInfoCard {...customIconProps} />);
    
    expect(container.innerHTML).toContain('🌱');
  });

  it('renders with long text content', () => {
    const longTextProps = {
      ...defaultProps,
      text: 'This is a very long text that explains in detail how predictions work and provides the user with comprehensive information about the system\'s functionality and how they should interpret the data that is being presented to them.',
    };
    
    const { container } = render(<UnderstandingPredInfoCard {...longTextProps} />);
    
    expect(container.innerHTML).toContain(longTextProps.text);
  });

  it('has correct styling for hover state', () => {
    const { container } = render(<UnderstandingPredInfoCard {...defaultProps} />);
    
    // Check hover properties - using lowercase to match what's in the DOM
    expect(container.innerHTML).toContain('_hover=');
    expect(container.innerHTML).toContain('transition="transform 0.2s"');
    expect(container.innerHTML).toContain('boxshadow="sm"');
  });
}); 