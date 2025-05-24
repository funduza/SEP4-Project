import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PredictionChartContainer from './PredictionChartContainer';
import { ReactNode } from 'react';
import { ChartDataItem, Ranges, TimeRangeOption, SensorType } from './types';

// Mock the ChakraLineChart component
vi.mock('../../ui/chakra-chart', () => ({
  __esModule: true,
  ChakraLineChart: (props: any) => (
    <div data-testid="mocked-chart" data-keys={JSON.stringify(props.yAxisKeys)} data-ref-points={JSON.stringify(props.referencePoints)}>
      <div data-testid="chart-data">{JSON.stringify(props.data)}</div>
      <div data-testid="chart-xaxis">{props.xAxisKey}</div>
    </div>
  )
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-box" {...props}>{children}</div>,
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Heading: ({ children, ...props }: { children: ReactNode }) => <h2 data-testid="chakra-heading" {...props}>{children}</h2>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
}));

describe('PredictionChartContainer', () => {
  // Mock data for tests
  const mockProcessedData: ChartDataItem[] = [
    { timestamp: '2023-05-10T10:00:00Z', temp: 25, air_humidity: 60, soil_humidity: 55, co2_level: 800, light_lux: 1200 },
    { timestamp: '2023-05-10T11:00:00Z', temp: 26, air_humidity: 58, soil_humidity: 53, co2_level: 820, light_lux: 1300 }
  ];

  const mockRanges: Ranges = {
    temp: { min: 15, max: 35, ideal: { min: 22, max: 28 } },
    air_humidity: { min: 35, max: 75, ideal: { min: 50, max: 65 } },
    soil_humidity: { min: 30, max: 70, ideal: { min: 45, max: 60 } },
    co2_level: { min: 400, max: 1500, ideal: { min: 700, max: 1200 } },
    light_lux: { min: 0, max: 2000, ideal: { min: 800, max: 1800 } }
  };

  const mockTimeRangeOptions: TimeRangeOption[] = [
    { value: '6h', label: 'Next 6 Hours' },
    { value: '24h', label: 'Next 24 Hours' }
  ];

  const mockSensorTypes: SensorType[] = [
    { id: 'temp', label: 'Temperature', unit: '°C', color: '#ff6b6b' },
    { id: 'air_humidity', label: 'Air Humidity', unit: '%', color: '#4dabf7' }
  ];

  // Default props for most tests
  const defaultProps = {
    processedChartData: mockProcessedData,
    selectedRange: '24h',
    handleRangeChange: vi.fn(),
    selectedSensorType: 'temp',
    setSelectedSensorType: vi.fn(),
    ranges: mockRanges,
    timeRangeOptions: mockTimeRangeOptions,
    sensorTypes: mockSensorTypes,
    formatChartXAxis: vi.fn().mockImplementation((value) => value),
    getPredictionRangeText: vi.fn().mockReturnValue('Next 24 Hours'),
    lastUpdated: new Date('2023-05-10T12:00:00Z')
  };

  it('renders the component title correctly', () => {
    const { container } = render(<PredictionChartContainer {...defaultProps} />);
    expect(container.innerHTML).toContain('Prediction Trends');
  });

  it('renders the prediction range selector with correct options', () => {
    const { container } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Check that the select element contains the right options
    expect(container.innerHTML).toContain('Next 6 Hours');
    expect(container.innerHTML).toContain('Next 24 Hours');
  });

  it('calls handleRangeChange when a new range is selected', () => {
    const { container } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Find the select element
    const select = container.querySelector('select');
    expect(select).not.toBeNull();
    
    // Trigger change event
    if (select) {
      fireEvent.change(select, { target: { value: '6h' } });
      expect(defaultProps.handleRangeChange).toHaveBeenCalled();
    }
  });

  it('displays correct sensor type tabs', () => {
    const { container } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Check for sensor type tabs
    expect(container.innerHTML).toContain('Temperature');
    expect(container.innerHTML).toContain('Air Humidity');
  });

  it('changes the selected sensor type when a tab is clicked', () => {
    const { container } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Find the Air Humidity tab
    const tabs = Array.from(container.querySelectorAll('[data-testid="chakra-box"]'))
      .filter(el => el.textContent === 'Air Humidity');
    
    expect(tabs.length).toBeGreaterThan(0);
    
    // Click the Air Humidity tab
    fireEvent.click(tabs[0]);
    expect(defaultProps.setSelectedSensorType).toHaveBeenCalledWith('air_humidity');
  });

  it('renders ChakraLineChart with correct props for selected sensor type', () => {
    const { getAllByTestId } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Get all charts and find the one that's visible (the temperature chart)
    const mockedCharts = getAllByTestId('mocked-chart');
    // The first chart should be the temperature chart since it's the selected sensor type
    const tempChart = mockedCharts[0];
    const keysData = JSON.parse(tempChart.getAttribute('data-keys') || '[]');
    
    // Check that chart has correct sensor type settings
    expect(keysData[0].key).toBe('temp');
    expect(keysData[0].color).toBe('#ff6b6b');
    expect(keysData[0].name).toBe('Temperature (°C)');
  });

  it('passes correct reference point data to ChakraLineChart', () => {
    const { getAllByTestId } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Get all charts and find the one that's visible (the temperature chart)
    const mockedCharts = getAllByTestId('mocked-chart');
    // The first chart should be the temperature chart since it's the selected sensor type
    const tempChart = mockedCharts[0];
    const refPoints = JSON.parse(tempChart.getAttribute('data-ref-points') || '[]');
    
    // Check that reference points are correct for temperature
    expect(refPoints.length).toBe(2);
    expect(refPoints[0].y).toBe(22); // Min ideal temp
    expect(refPoints[1].y).toBe(28); // Max ideal temp
  });

  it('displays the current prediction range text', () => {
    const { container } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Check that the prediction range text is displayed
    expect(container.innerHTML).toContain('Showing:');
    expect(container.innerHTML).toContain('Next 24 Hours');
  });

  it('correctly updates chart when lastUpdated changes', () => {
    // First render
    const { rerender, getAllByTestId } = render(<PredictionChartContainer {...defaultProps} />);
    
    // Get chart data from the first render
    const chartDataElements = getAllByTestId('chart-data');
    const firstChartData = chartDataElements[0].textContent;
    
    // Rerender with a new lastUpdated time
    const newProps = {
      ...defaultProps,
      lastUpdated: new Date('2023-05-10T13:00:00Z')
    };
    
    rerender(<PredictionChartContainer {...newProps} />);
    
    // Get updated chart data
    const updatedChartDataElements = getAllByTestId('chart-data');
    const updatedChartData = updatedChartDataElements[0].textContent;
    
    // The data should still be the same since we're only changing lastUpdated
    expect(updatedChartData).toBe(firstChartData);
    expect(updatedChartData).toContain('temp');
  });
}); 