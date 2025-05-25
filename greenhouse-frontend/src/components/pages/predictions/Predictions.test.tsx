import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Predictions from './Predictions';
import { ReactNode } from 'react';
import * as usePredictionsModule from '../../../utils/usePredictions';
import { PredictionData, Insight } from './types';

// Mock all child components
vi.mock('./UpcomingPredictedValues/UpcomingReadingsGrid', () => ({
  __esModule: true,
  default: ({ currentReading }: any) => (
    <div data-testid="mocked-readings-grid">
      {currentReading && <div data-testid="current-reading">{JSON.stringify(currentReading)}</div>}
    </div>
  )
}));

vi.mock('./RecommendedActions/RecommendedActions', () => ({
  __esModule: true,
  default: ({ insights }: any) => (
    <div data-testid="mocked-recommended-actions">
      {insights && <div data-testid="insights">{JSON.stringify(insights)}</div>}
    </div>
  )
}));

vi.mock('./PredictionChartContainer', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="mocked-chart-container">
      <div>Chart Container</div>
      <button 
        data-testid="range-change-button" 
        onClick={() => props.handleRangeChange({ target: { value: '12h' } })}
      >
        Change Range
      </button>
      <button 
        data-testid="sensor-change-button" 
        onClick={() => props.setSelectedSensorType('air_humidity')}
      >
        Change Sensor Type
      </button>
    </div>
  )
}));

vi.mock('./UnderstandingYourPredictions/UnderstandingPredictions', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mocked-understanding-predictions">
      Understanding Your Predictions Component
    </div>
  )
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Heading: ({ children, ...props }: { children: ReactNode }) => <h1 data-testid="chakra-heading" {...props}>{children}</h1>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  Spinner: () => <div data-testid="chakra-spinner">Loading...</div>,
}));

describe('Predictions', () => {
  // Sample prediction data that matches the PredictionData type
  const samplePredictionData: PredictionData[] = [
    { 
      id: 1, 
      predicted_temp: 25, 
      predicted_air_humidity: 60, 
      predicted_soil_humidity: 55, 
      predicted_co2_level: 800, 
      predicted_light_lux: 1200, 
      timestamp: '2023-05-10T10:00:00Z',
      parsedDate: new Date('2023-05-10T10:00:00Z'),
      ms: 1683712800000
    },
    { 
      id: 2, 
      predicted_temp: 26, 
      predicted_air_humidity: 58, 
      predicted_soil_humidity: 53, 
      predicted_co2_level: 820, 
      predicted_light_lux: 1300, 
      timestamp: '2023-05-10T11:00:00Z',
      parsedDate: new Date('2023-05-10T11:00:00Z'),
      ms: 1683716400000
    }
  ];

  // Create a base mock object for usePredictions
  const createMockPredictionsHook = (overrides = {}) => ({
    predictionData: samplePredictionData,
    selectedRange: '24h',
    selectedSensorType: 'temp',
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
    isGenerating: false,
    dataSource: 'api',
    messageText: '',
    messageType: null,
    isRefreshing: false,
    handleGeneratePredictions: vi.fn().mockResolvedValue(undefined),
    handleRangeChange: vi.fn(),
    setSelectedSensorType: vi.fn(),
    processedChartData: [
      { timestamp: '2023-05-10T10:00:00Z', temp: 25, air_humidity: 60 },
      { timestamp: '2023-05-10T11:00:00Z', temp: 26, air_humidity: 58 }
    ],
    currentReading: { ...samplePredictionData[0], ms: 1683712800000 },
    getReadingColor: vi.fn().mockReturnValue('green'),
    getPredictionRangeText: vi.fn().mockReturnValue('Next 24 Hours'),
    generatedInsights: [
      { type: 'success' as const, icon: '🌡️', message: 'Temperature is ideal', sensor: 'temp' } as Insight
    ],
    formatChartXAxis: vi.fn().mockImplementation(value => value),
    showMessage: vi.fn(),
    ...overrides
  });

  beforeEach(() => {
    // Set up the default mock
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook()
    );
  });

  it('renders the main page title correctly', () => {
    render(<Predictions />);
    const headingElement = screen.getByTestId('chakra-heading');
    expect(headingElement.textContent).toBe('Sensor Predictions');
  });

  it('displays a loading spinner when isLoading is true', () => {
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({ isLoading: true })
    );
    
    render(<Predictions />);
    expect(screen.getByTestId('chakra-spinner')).toBeDefined();
    expect(screen.queryByTestId('mocked-readings-grid')).toBeNull();
  });

  it('displays an error message when there is an error', () => {
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({
        error: 'Failed to fetch prediction data',
        predictionData: []
      })
    );
    
    render(<Predictions />);
    expect(screen.getByText(/Failed to fetch prediction data/)).toBeDefined();
  });

  it('displays empty state when no data is available', () => {
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({
        predictionData: [],
        dataSource: 'empty database'
      })
    );
    
    render(<Predictions />);
    expect(screen.getByText(/Database is Empty/)).toBeDefined();
    expect(screen.getByText(/Click "Generate New Predictions"/)).toBeDefined();
  });

  it('renders child components when data is available', () => {
    render(<Predictions />);
    
    // All main components should be rendered
    expect(screen.getByTestId('mocked-readings-grid')).toBeDefined();
    expect(screen.getByTestId('mocked-recommended-actions')).toBeDefined();
    expect(screen.getByTestId('mocked-chart-container')).toBeDefined();
    expect(screen.getByTestId('mocked-understanding-predictions')).toBeDefined();
  });

  it('passes the correct props to UpcomingReadingsGrid', () => {
    render(<Predictions />);
    
    const currentReadingElement = screen.getByTestId('current-reading');
    const currentReadingJson = JSON.parse(currentReadingElement.textContent || '{}');
    
    // Check that currentReading is passed correctly
    expect(currentReadingJson.predicted_temp).toBe(25);
    expect(currentReadingJson.predicted_air_humidity).toBe(60);
  });

  it('passes the correct insights to RecommendedActions', () => {
    render(<Predictions />);
    
    const insightsElement = screen.getByTestId('insights');
    const insightsJson = JSON.parse(insightsElement.textContent || '[]');
    
    // Check that insights are passed correctly
    expect(insightsJson[0].type).toBe('success');
    expect(insightsJson[0].message).toBe('Temperature is ideal');
  });

  it('calls generate predictions when button is clicked', () => {
    const handleGeneratePredictions = vi.fn();
    
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({ handleGeneratePredictions })
    );
    
    render(<Predictions />);
    
    // Find the generate button by its text content
    const generateButton = screen.getByText(/Generate New Predictions/);
    fireEvent.click(generateButton);
    
    expect(handleGeneratePredictions).toHaveBeenCalled();
  });

  it('disables generate button when isGenerating is true', () => {
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({ isGenerating: true })
    );
    
    render(<Predictions />);
    
    const generateButton = screen.getByText(/Generating.../);
    expect(generateButton.closest('button')?.disabled).toBe(true);
  });

  it('displays a success message when messageText is set', () => {
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({
        messageText: 'Predictions generated successfully!',
        messageType: 'success'
      })
    );
    
    render(<Predictions />);
    expect(screen.getByText(/Predictions generated successfully!/)).toBeDefined();
  });

  it('displays refreshing indicator when isRefreshing is true', () => {
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({ isRefreshing: true })
    );
    
    render(<Predictions />);
    expect(screen.getByText(/Refreshing.../)).toBeDefined();
  });

  it('propagates range change events from PredictionChartContainer', () => {
    const handleRangeChange = vi.fn();
    
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({ handleRangeChange })
    );
    
    render(<Predictions />);
    
    const rangeChangeButton = screen.getByTestId('range-change-button');
    fireEvent.click(rangeChangeButton);
    
    expect(handleRangeChange).toHaveBeenCalled();
  });

  it('propagates sensor type change events from PredictionChartContainer', () => {
    const setSelectedSensorType = vi.fn();
    
    vi.spyOn(usePredictionsModule, 'usePredictions').mockImplementation(() => 
      createMockPredictionsHook({ setSelectedSensorType })
    );
    
    render(<Predictions />);
    
    const sensorChangeButton = screen.getByTestId('sensor-change-button');
    fireEvent.click(sensorChangeButton);
    
    expect(setSelectedSensorType).toHaveBeenCalledWith('air_humidity');
  });
}); 