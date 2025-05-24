import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecommendedActions from './RecommendedActions';
import { ReactNode } from 'react';
import { Insight } from '../types';

// Mock the RecommendedActionCard component
vi.mock('./RecommendedActionCard', () => ({
  __esModule: true,
  default: ({ icon, sensorName, message, type }: any) => (
    <div data-testid="mocked-action-card" data-sensor={sensorName} data-type={type}>
      <div data-testid="icon">{icon}</div>
      <div data-testid="sensor">{sensorName}</div>
      <div data-testid="message">{message}</div>
    </div>
  )
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Heading: ({ children, ...props }: { children: ReactNode }) => <h2 data-testid="chakra-heading" {...props}>{children}</h2>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  SimpleGrid: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-grid" {...props}>{children}</div>,
}));

describe('RecommendedActions', () => {
  // Sample insights for testing
  const sampleInsights: Insight[] = [
    {
      type: 'warning',
      icon: '🌡️',
      message: 'Temperature is rising above optimal levels.',
      sensor: 'temperature'
    },
    {
      type: 'warning',
      icon: '💧',
      message: 'Air humidity is too low.',
      sensor: 'air_humidity'
    },
    {
      type: 'success',
      icon: '🌱',
      message: 'Soil moisture is within optimal range.',
      sensor: 'soil_humidity'
    }
  ];

  it('returns null when no insights are provided', () => {
    const { container } = render(<RecommendedActions insights={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when insights is undefined', () => {
    // @ts-ignore 
    const { container } = render(<RecommendedActions insights={undefined} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders correctly with three insights', () => {
    const { container, getAllByTestId } = render(<RecommendedActions insights={sampleInsights} />);
    
    // Check title is rendered
    expect(container.innerHTML).toContain('Recommended Actions');
    
    // Should have 3 action cards
    const cards = getAllByTestId('mocked-action-card');
    expect(cards.length).toBe(3);
    
    // First card should show Temperature
    expect(cards[0].getAttribute('data-sensor')).toBe('Temperature');
    
    // Second card should show Air Humidity
    expect(cards[1].getAttribute('data-sensor')).toBe('Air Humidity');
    
    // Third card should show Soil Humidity
    expect(cards[2].getAttribute('data-sensor')).toBe('Soil Humidity');
  });

  it('renders single-row layout for 3 or fewer insights', () => {
    const { container } = render(<RecommendedActions insights={sampleInsights} />);
    
    // Should have only one SimpleGrid
    const gridMatches = container.innerHTML.match(/data-testid="chakra-grid"/g);
    expect(gridMatches?.length).toBe(1);
  });

  it('renders two-row layout for more than 3 insights', () => {
    // Create extended insights array with 5 items
    const extendedInsights: Insight[] = [
      ...sampleInsights,
      {
        type: 'warning',
        icon: '☁️',
        message: 'CO2 levels are too high.',
        sensor: 'co2_level'
      },
      {
        type: 'success',
        icon: '☀️',
        message: 'Light levels are too low.',
        sensor: 'light_lux'
      }
    ];
    
    const { container, getAllByTestId } = render(<RecommendedActions insights={extendedInsights} />);
    
    // Check title is rendered
    expect(container.innerHTML).toContain('Recommended Actions');
    
    // Should have 5 action cards
    const cards = getAllByTestId('mocked-action-card');
    expect(cards.length).toBe(5);
    
    // Should have multiple SimpleGrids for the two-row layout
    const gridMatches = container.innerHTML.match(/data-testid="chakra-grid"/g);
    expect(gridMatches?.length).toBe(2);
    
    // 4th card should be CO2 Level
    expect(cards[3].getAttribute('data-sensor')).toBe('CO2 Level');
    
    // 5th card should be Light
    expect(cards[4].getAttribute('data-sensor')).toBe('Light');
  });

  it('correctly maps sensor types to display names', () => {
    const testInsights: Insight[] = [
      { type: 'success', icon: '🌡️', message: 'Message 1', sensor: 'temperature' },
      { type: 'warning', icon: '💧', message: 'Message 2', sensor: 'air_humidity' },
      { type: 'success', icon: '🌱', message: 'Message 3', sensor: 'soil_humidity' },
      { type: 'warning', icon: '☁️', message: 'Message 4', sensor: 'co2_level' },
      { type: 'success', icon: '☀️', message: 'Message 5', sensor: 'light_lux' }
    ];
    
    const { getAllByTestId } = render(<RecommendedActions insights={testInsights} />);
    
    const cards = getAllByTestId('mocked-action-card');
    
    // Check all sensor mappings
    expect(cards[0].getAttribute('data-sensor')).toBe('Temperature');
    expect(cards[1].getAttribute('data-sensor')).toBe('Air Humidity');
    expect(cards[2].getAttribute('data-sensor')).toBe('Soil Humidity');
    expect(cards[3].getAttribute('data-sensor')).toBe('CO2 Level');
    expect(cards[4].getAttribute('data-sensor')).toBe('Light');
  });
}); 