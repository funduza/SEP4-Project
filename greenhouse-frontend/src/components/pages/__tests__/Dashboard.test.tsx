import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../dashboard/Dashboard';
import '@testing-library/jest-dom';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  hostname: 'localhost'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('Dashboard Component', () => {
  const mockSensorData = {
    temperature: 25.5,
    humidity: 60,
    soil_humidity: 55,
    co2_level: 800,
    light_lux: 5000,
    prediction: 'Normal',
    timestamp: new Date().toISOString()
  };

  const mockHistoricalData = [
    {
      temperature: 24.5,
      humidity: 58,
      soil_humidity: 54,
      co2_level: 750,
      light_lux: 4800,
      prediction: 'Normal',
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      temperature: 25.0,
      humidity: 59,
      soil_humidity: 55,
      co2_level: 780,
      light_lux: 4900,
      prediction: 'Normal',
      timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
    },
    mockSensorData
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSensorData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockHistoricalData })
      });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should render dashboard successfully', () => {
    renderDashboard();
    
    expect(screen.getByText('Via GreenHouse Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Current Sensor Data')).toBeInTheDocument();
    expect(screen.getByText('Historical Data')).toBeInTheDocument();
  });

  it('should load and display current sensor data', async () => {
    renderDashboard();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getByText('Air + Soil Humidity')).toBeInTheDocument();
      expect(screen.getByText('CO₂ Level')).toBeInTheDocument();
      expect(screen.getByText('Light Level')).toBeInTheDocument();
    });

    // Check if data is displayed
    expect(screen.getByText('25.5°C')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  it('should change time range and update historical data', async () => {
    renderDashboard();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Historical Data')).toBeInTheDocument();
    });

    // Change time range
    const timeRangeSelect = screen.getByRole('combobox');
    fireEvent.change(timeRangeSelect, { target: { value: '6h' } });

    // Verify API call for new time range
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sensors/history?range=6h'),
        expect.any(Object)
      );
    });
  });

  it('should switch between chart tabs', async () => {
    renderDashboard();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Temperature')).toBeInTheDocument();
    });

    // Click on different tabs
    fireEvent.click(screen.getByText('Air Humidity'));
    expect(screen.getByText('Air Humidity Trend')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Soil Humidity'));
    expect(screen.getByText('Soil Humidity Trend')).toBeInTheDocument();

    fireEvent.click(screen.getByText('CO₂ Level'));
    expect(screen.getByText('CO₂ Level Trend')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Light Level'));
    expect(screen.getByText('Light Level Trend')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderDashboard();

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
    });

    // Verify retry button
    const retryButton = screen.getByText('Retry Connection');
    expect(retryButton).toBeInTheDocument();
  });

  it('should show loading states correctly', () => {
    renderDashboard();

    // Check for loading skeletons
    expect(screen.getAllByTestId('card-skeleton')).toHaveLength(4);
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });

  it('should handle no data in selected time range', async () => {
    // Mock empty historical data response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSensorData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      });

    renderDashboard();

    // Wait for the no data message
    await waitFor(() => {
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText('No data available for the selected time range. Please try a different range.')).toBeInTheDocument();
    });
  });
}); 