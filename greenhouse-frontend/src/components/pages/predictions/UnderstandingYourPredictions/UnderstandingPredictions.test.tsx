import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnderstandingPredictions from './UnderstandingPredictions';
import { ReactNode } from 'react';

// Mock the UnderstandingPredInfoCard component
vi.mock('./UnderstandingPredInfoCard', () => ({
  __esModule: true,
  default: ({ icon, title, text, themeColor }: any) => (
    <div data-testid="mocked-info-card" data-color={themeColor}>
      <div data-testid="icon">{icon}</div>
      <div data-testid="title">{title}</div>
      <div data-testid="text">{text}</div>
    </div>
  )
}));

// Create effective mocks for Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Heading: ({ children, ...props }: { children: ReactNode }) => <h3 data-testid="chakra-heading" {...props}>{children}</h3>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  SimpleGrid: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-grid" {...props}>{children}</div>,
}));

describe('UnderstandingPredictions', () => {
  it('renders the component title correctly', () => {
    const { container } = render(<UnderstandingPredictions />);
    
    // Check title is rendered
    expect(container.innerHTML).toContain('Understanding Your Predictions');
  });

  it('renders the info icon in the header', () => {
    const { container } = render(<UnderstandingPredictions />);
    
    // Check the info icon is rendered
    expect(container.innerHTML).toContain('💡');
    expect(container.innerHTML).toContain('aria-label="info"');
  });

  it('renders exactly two UnderstandingPredInfoCard components', () => {
    const { getAllByTestId } = render(<UnderstandingPredictions />);
    
    // Should have 2 info cards
    const cards = getAllByTestId('mocked-info-card');
    expect(cards.length).toBe(2);
  });

  it('passes correct props to the first info card', () => {
    const { getAllByTestId } = render(<UnderstandingPredictions />);
    
    const cards = getAllByTestId('mocked-info-card');
    const icons = getAllByTestId('icon');
    const titles = getAllByTestId('title');
    
    // First card
    expect(cards[0].getAttribute('data-color')).toBe('blue');
    expect(icons[0].textContent).toBe('🔄');
    expect(titles[0].textContent).toBe('Data Refresh System');
    // Text contains key phrase
    expect(cards[0].innerHTML).toContain('refresh automatically every 30 seconds');
  });

  it('passes correct props to the second info card', () => {
    const { getAllByTestId } = render(<UnderstandingPredictions />);
    
    const cards = getAllByTestId('mocked-info-card');
    const icons = getAllByTestId('icon');
    const titles = getAllByTestId('title');
    
    // Second card
    expect(cards[1].getAttribute('data-color')).toBe('green');
    expect(icons[1].textContent).toBe('🌱');
    expect(titles[1].textContent).toBe('Actionable Insights');
    // Text contains key phrase
    expect(cards[1].innerHTML).toContain('prediction model');
  });

  it('renders the "How to use" section', () => {
    const { container } = render(<UnderstandingPredictions />);
    
    // Check the how-to section elements
    expect(container.innerHTML).toContain('How to use these predictions');
    expect(container.innerHTML).toContain('📈');
    expect(container.innerHTML).toContain('These predictions show expected sensor values');
  });

  it('renders with responsive grid layout', () => {
    const { container } = render(<UnderstandingPredictions />);
    
    // Check if SimpleGrid has the responsive columns prop
    expect(container.innerHTML).toContain('columns=');
    // In the DOM, the object is stringified, so it appears as [object Object]
    expect(container.innerHTML).toContain('[object Object]');
  });

  it('has proper box styling for main container', () => {
    const { container } = render(<UnderstandingPredictions />);
    
    // Check main container styling - using lowercase to match what's in the DOM
    expect(container.innerHTML).toContain('borderradius="xl"');
    expect(container.innerHTML).toContain('boxshadow="lg"');
    expect(container.innerHTML).toContain('overflow="hidden"');
  });

  it('has blue header styling', () => {
    const { container } = render(<UnderstandingPredictions />);
    
    // Check header styling
    expect(container.innerHTML).toContain('bg="blue.600"');
    expect(container.innerHTML).toContain('color="white"');
  });
}); 