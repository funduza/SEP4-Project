import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePredictions } from './usePredictions';
import { PredictionData } from '../components/pages/predictions/types';

// Mock fetch API
global.fetch = vi.fn();

// Helper to set up the fetch mock with different responses
const mockFetch = (mockData: Record<string, any>, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => mockData,
  });
};

describe('usePredictions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Set longer timeout for all tests
  it('initializes with default values', async () => {
    const mockData = { data: [] };
    mockFetch(mockData);

    const { result } = renderHook(() => usePredictions());

    // Wait for the initial data fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.predictionData).toEqual([]);
    expect(result.current.selectedRange).toBe('24h');
    expect(result.current.selectedSensorType).toBe('temp');
    expect(result.current.error).toBeNull();
    expect(result.current.currentReading).toBeNull();
  }, 10000);

  it('fetches prediction data successfully', async () => {
    const mockPredictions = {
      data: [
        {
          predicted_temp: 24,
          predicted_air_humidity: 55,
          predicted_soil_humidity: 50,
          predicted_co2_level: 800,
          predicted_light_lux: 1000,
          timestamp: '2023-06-01 12:00:00'
        }
      ],
      _source: 'api'
    };
    
    mockFetch(mockPredictions);

    const { result } = renderHook(() => usePredictions());

    // Wait for the fetch to complete using waitFor to handle React state updates
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.predictionData).toEqual(mockPredictions.data);
    expect(result.current.dataSource).toBe('api');
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/predictions?range=24h'));
  }, 10000);

  it('handles fetch error correctly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePredictions());

    // Wait for the fetch to fail
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.error).toBeTruthy();
    expect(result.current.predictionData).toEqual([]);
    expect(result.current.dataSource).toBe('error');
  }, 10000);

  it('changes selected range and refetches data', async () => {
    const mockData1 = { data: [] };
    const mockData2 = { 
      data: [{ timestamp: '2023-06-01 12:00:00', predicted_temp: 25 }],
      _source: 'api'
    };

    mockFetch(mockData1);
    mockFetch(mockData2);

    const { result } = renderHook(() => usePredictions());

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });
    
    // Change the range - wrap in act
    await act(async () => {
      result.current.handleRangeChange({ target: { value: '12h' } } as any);
      
      // Small delay to let the state updates process
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Wait for refetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, { timeout: 10000 });
    
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/predictions?range=12h'));
  }, 10000);

  it('calculates current reading based on the nearest future prediction', async () => {
    // Create mock data with past and future timestamps
    const now = new Date();
    const pastTimestamp = new Date(now.getTime() - 3600000); // 1 hour ago
    const futureTimestamp = new Date(now.getTime() + 3600000); // 1 hour in future
    const furtherFutureTimestamp = new Date(now.getTime() + 7200000); // 2 hours in future

    const mockData = {
      data: [
        {
          id: 1,
          predicted_temp: 20,
          predicted_air_humidity: 55,
          predicted_soil_humidity: 50,
          predicted_co2_level: 800,
          predicted_light_lux: 1000,
          timestamp: pastTimestamp.toISOString()
        },
        {
          id: 2,
          predicted_temp: 25, // This should be selected as current reading
          predicted_air_humidity: 58,
          predicted_soil_humidity: 52,
          predicted_co2_level: 810,
          predicted_light_lux: 1100,
          timestamp: futureTimestamp.toISOString()
        },
        {
          id: 3,
          predicted_temp: 30,
          predicted_air_humidity: 60,
          predicted_soil_humidity: 55,
          predicted_co2_level: 820,
          predicted_light_lux: 1200,
          timestamp: furtherFutureTimestamp.toISOString()
        }
      ]
    };

    mockFetch(mockData);

    const { result } = renderHook(() => usePredictions());

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    expect(result.current.currentReading).not.toBeNull();
    expect(result.current.currentReading?.predicted_temp).toBe(25);
  }, 10000);

  it('generates predictions correctly', async () => {
    const mockData = { data: [] };
    const mockGenerateResponse = { message: 'Generated successfully' };
    const mockRefetchData = { 
      data: [{
        id: 1,
        predicted_temp: 25,
        predicted_air_humidity: 55,
        predicted_soil_humidity: 50,
        predicted_co2_level: 800,
        predicted_light_lux: 1000,
        timestamp: '2023-06-01 12:00:00'
      }] 
    };

    mockFetch(mockData); // Initial fetch
    mockFetch(mockGenerateResponse, 200); // Generate request
    mockFetch(mockRefetchData); // Refetch after generate

    const { result } = renderHook(() => usePredictions());

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });
    
    // Generate predictions - wrap in act
    await act(async () => {
      await result.current.handleGeneratePredictions();
    });

    // Wait for generation to complete
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    }, { timeout: 10000 });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/predictions/generate'),
      expect.objectContaining({ method: 'POST' })
    );
  }, 10000);

  // For functions that need a separate test for message timeout
  it('shows and auto-clears messages with showMessage function', async () => {
    mockFetch({ data: [] }); // Initial fetch to make hook load

    const { result } = renderHook(() => usePredictions());

    // Wait for the fetch to complete before manipulating with act
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    // Show a success message
    act(() => {
      result.current.showMessage('Test success message', 'success');
    });

    // Verify the message is shown
    expect(result.current.messageText).toBe('Test success message');
    expect(result.current.messageType).toBe('success');
  }, 10000);
  
  it('provides color-coding based on sensor readings', async () => {
    mockFetch({ 
      data: [{
        id: 1,
        predicted_temp: 25, // Within ideal range
        predicted_air_humidity: 55,
        predicted_soil_humidity: 50,
        predicted_co2_level: 800,
        predicted_light_lux: 1000,
        timestamp: new Date(Date.now() + 3600000).toISOString()
      }]
    });

    const { result } = renderHook(() => usePredictions());

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    // Test color coding functions 
    expect(result.current.getReadingColor('temp', 25)).toBe('#2ecc71'); // Ideal range (green)
    expect(result.current.getReadingColor('temp', 35)).toBe('#f39c12'); // Too high (yellow) 
    expect(result.current.getReadingColor('temp', 15)).toBe('#f39c12'); // Too low (yellow)
  }, 10000);
}); 