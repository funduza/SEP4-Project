import { render, screen, RenderResult } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpcomingReadingCard from './UpcomingReadingCard';
import { ReactElement, ReactNode } from 'react';

const customRender = (ui: ReactElement, options = {}): RenderResult => {
  return render(ui, options);
};

// Create a more effective mock for Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  Badge: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-badge" {...props}>{children}</div>,
}));

const mockGetReadingColor = vi.fn();

const defaultProps = {
  title: 'Temperature',
  icon: '🌡️',
  value: 25,
  unit: '°C',
  status: 'Ideal',
  idealRangeMin: 20,
  idealRangeMax: 30,
  getReadingColor: mockGetReadingColor,
  colorType: 'temperature',
  iconBgColor: 'blue.100',
  iconColor: 'blue.500',
};

describe('UpcomingReadingCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetReadingColor.mockReturnValue('green.500');
  });

  it('renders all component elements correctly', () => {
    const { container, debug } = customRender(<UpcomingReadingCard {...defaultProps} />);
    
    // For debugging, uncomment the line below to see the rendered HTML
    debug();
    
    // Check that all key parts are present in the output
    expect(container.innerHTML).toContain('Temperature');
    expect(container.innerHTML).toContain('🌡️');
    expect(container.innerHTML).toContain('25');
    expect(container.innerHTML).toContain('°C');
    expect(container.innerHTML).toContain('Ideal');
    
    const idealRangeText = `Ideal range: ${defaultProps.idealRangeMin}-${defaultProps.idealRangeMax}${defaultProps.unit}`;
    expect(container.innerHTML).toContain(idealRangeText);
  });

  it('calls getReadingColor with correct parameters', () => {
    customRender(<UpcomingReadingCard {...defaultProps} />);
    
    // Check that getReadingColor is called at least once
    expect(mockGetReadingColor).toHaveBeenCalled();
    
    // Verify one of the calls with correct parameters
    expect(mockGetReadingColor).toHaveBeenCalledWith(defaultProps.colorType, defaultProps.value);
  });

  it('displays "Too High" status correctly with high values', () => {
    const highValue = 35;
    const highProps = {
      ...defaultProps,
      value: highValue,
      status: 'Too High',
    };

    // Override the mock for this specific test
    mockGetReadingColor.mockReturnValue('red.500');

    const { container } = customRender(<UpcomingReadingCard {...highProps} />);
    
    expect(container.innerHTML).toContain('Too High');
    expect(container.innerHTML).toContain(highValue.toString());
    expect(mockGetReadingColor).toHaveBeenCalledWith(defaultProps.colorType, highValue);
  });

  it('displays "Too Low" status correctly with low values', () => {
    const lowValue = 15;
    const lowProps = {
      ...defaultProps,
      value: lowValue,
      status: 'Too Low',
    };

    // Override the mock for this specific test
    mockGetReadingColor.mockReturnValue('yellow.500');

    const { container } = customRender(<UpcomingReadingCard {...lowProps} />);
    
    expect(container.innerHTML).toContain('Too Low');
    expect(container.innerHTML).toContain(lowValue.toString());
    expect(mockGetReadingColor).toHaveBeenCalledWith(defaultProps.colorType, lowValue);
  });

  it('renders with custom icon and colors', () => {
    const customProps = {
      ...defaultProps,
      icon: '💧',
      colorType: 'humidity',
      iconBgColor: 'teal.100',
      iconColor: 'teal.500',
    };

    const { container } = customRender(<UpcomingReadingCard {...customProps} />);
    
    expect(container.innerHTML).toContain('💧');
    expect(mockGetReadingColor).toHaveBeenCalledWith('humidity', defaultProps.value);
    expect(container.innerHTML).toContain('teal.100');
    expect(container.innerHTML).toContain('teal.500');
  });

  it('displays correct ideal range', () => {
    const customRangeProps = {
      ...defaultProps,
      idealRangeMin: 15,
      idealRangeMax: 25,
    };

    const { container } = customRender(<UpcomingReadingCard {...customRangeProps} />);
    
    const idealRangeText = `Ideal range: 15-25${defaultProps.unit}`;
    expect(container.innerHTML).toContain(idealRangeText);
  });
}); 