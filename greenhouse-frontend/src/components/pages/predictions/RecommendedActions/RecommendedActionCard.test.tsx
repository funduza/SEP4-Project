import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecommendedActionCard from './RecommendedActionCard';
import { ReactNode } from 'react';

// Create effective mocks for Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
}));

describe('RecommendedActionCard', () => {
  // Default props for most tests
  const defaultProps = {
    icon: '🌡️',
    sensorName: 'Temperature',
    message: 'Increase ventilation to reduce temperature.',
    type: 'warning',
  };

  it('renders correctly with warning type', () => {
    const { container } = render(<RecommendedActionCard {...defaultProps} />);
    
    // Check all content is rendered
    expect(container.innerHTML).toContain('🌡️');
    expect(container.innerHTML).toContain('Temperature');
    expect(container.innerHTML).toContain('Increase ventilation to reduce temperature.');
    
    // Check warning styling
    expect(container.innerHTML).toContain('yellow.50');
    expect(container.innerHTML).toContain('yellow.200');
    expect(container.innerHTML).toContain('yellow.700');
    expect(container.innerHTML).toContain('yellow.800');
  });

  it('renders correctly with info/success type', () => {
    const infoProps = {
      ...defaultProps,
      type: 'info',
    };
    
    const { container } = render(<RecommendedActionCard {...infoProps} />);
    
    // Check all content is rendered
    expect(container.innerHTML).toContain('🌡️');
    expect(container.innerHTML).toContain('Temperature');
    expect(container.innerHTML).toContain('Increase ventilation to reduce temperature.');
    
    // Check info/success styling
    expect(container.innerHTML).toContain('green.50');
    expect(container.innerHTML).toContain('green.200');
    expect(container.innerHTML).toContain('green.700');
    expect(container.innerHTML).toContain('green.800');
  });

  it('renders with different icon and sensor name', () => {
    const customProps = {
      icon: '💧',
      sensorName: 'Humidity',
      message: 'Consider using a dehumidifier.',
      type: 'warning',
    };
    
    const { container } = render(<RecommendedActionCard {...customProps} />);
    
    expect(container.innerHTML).toContain('💧');
    expect(container.innerHTML).toContain('Humidity');
    expect(container.innerHTML).toContain('Consider using a dehumidifier.');
  });

  it('renders with long message text', () => {
    const longMessageProps = {
      ...defaultProps,
      message: 'This is a very long message that provides detailed instructions about what actions should be taken to address the current environmental conditions in the greenhouse based on sensor readings and AI predictions.',
    };
    
    const { container } = render(<RecommendedActionCard {...longMessageProps} />);
    
    expect(container.innerHTML).toContain(longMessageProps.message);
  });

  it('renders with custom type string', () => {
    // The component should handle any type string, defaulting non-warning to green theme
    const customTypeProps = {
      ...defaultProps,
      type: 'custom-type',
    };
    
    const { container } = render(<RecommendedActionCard {...customTypeProps} />);
    
    // Should use green (non-warning) styling
    expect(container.innerHTML).toContain('green.50');
    expect(container.innerHTML).toContain('green.200');
  });
}); 