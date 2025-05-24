import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpcomingReadingsGrid from './UpcomingReadingsGrid';

// Mock the UpcomingReadingCard component
vi.mock('./UpcomingReadingCard', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="mocked-card" data-props={JSON.stringify(props)}>
      Mocked Card Component
    </div>
  )
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Flex: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Heading: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  SimpleGrid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>
}));

describe('UpcomingReadingsGrid', () => {
  const mockGetReadingColor = vi.fn().mockReturnValue('green');
  
  const mockRanges = {
    temp: { min: 15, max: 35, ideal: { min: 22, max: 28 } },
    air_humidity: { min: 35, max: 75, ideal: { min: 50, max: 65 } },
    soil_humidity: { min: 30, max: 70, ideal: { min: 45, max: 60 } },
    co2_level: { min: 400, max: 1500, ideal: { min: 700, max: 1200 } },
    light_lux: { min: 0, max: 2000, ideal: { min: 800, max: 1800 } }
  };

  const mockPredictionData = {
    predicted_temp: 24,
    predicted_air_humidity: 55,
    predicted_soil_humidity: 50,
    predicted_co2_level: 800,
    predicted_light_lux: 1000,
    timestamp: '2023-06-01 12:00:00'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no current reading is provided', () => {
    const { container } = render(
      <UpcomingReadingsGrid 
        currentReading={null} 
        ranges={mockRanges} 
        getReadingColor={mockGetReadingColor} 
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders with the correct data', () => {
    const { container, getAllByTestId } = render(
      <UpcomingReadingsGrid 
        currentReading={mockPredictionData} 
        ranges={mockRanges} 
        getReadingColor={mockGetReadingColor} 
      />
    );
    
    // Simple check that content is rendered
    expect(container.textContent).toContain('Upcoming Predicted Values');
    expect(container.textContent).toContain('Next Update');
    
    // Check for the mocked cards
    const cards = getAllByTestId('mocked-card');
    expect(cards.length).toBe(5); // Should have 5 reading cards
  });
}); 