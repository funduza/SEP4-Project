import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import DeviceLogs from './DeviceLogs';
import { ReactNode } from 'react';
import '@testing-library/jest-dom';

// Global test timeout
vi.setConfig({ testTimeout: 30000 });

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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, ...props }: { children: ReactNode; justifyContent?: string; alignItems?: string; textAlign?: string }) => {
    const { justifyContent, alignItems, textAlign, ...rest } = props;
    return <div data-testid="chakra-box" style={{ justifyContent, alignItems, textAlign }} {...rest}>{children}</div>;
  },
  Flex: ({ children, ...props }: { children: ReactNode; justifyContent?: string; alignItems?: string }) => {
    const { justifyContent, alignItems, ...rest } = props;
    return <div data-testid="chakra-flex" style={{ justifyContent, alignItems }} {...rest}>{children}</div>;
  },
  Heading: ({ children, ...props }: { children: ReactNode }) => <h1 data-testid="chakra-heading" {...props}>{children}</h1>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  Badge: ({ children, ...props }: { children: ReactNode }) => <span data-testid="chakra-badge" {...props}>{children}</span>,
  Button: ({ children, onClick, ...props }: { children: ReactNode; onClick?: () => void }) => (
    <button data-testid="chakra-button" onClick={onClick} {...props}>{children}</button>
  ),
  Select: ({ value, onChange, children, ...props }: any) => (
    <select data-testid="chakra-select" value={value} onChange={onChange} {...props}>{children}</select>
  ),
  Spinner: () => <div data-testid="chakra-spinner">Loading...</div>,
}));

describe('DeviceLogs Component', () => {
  const mockLogs = [
    {
      id: 1,
      device_id: 1,
      user_id: 1,
      username: 'testuser',
      action_type: 'status_change',
      old_value: 'OFF',
      new_value: 'ON',
      log_time: '2024-03-20T10:00:00Z',
      timeAgo: '1 minute ago',
      actionDisplay: 'Status Changed',
      formattedTime: '10:00 AM'
    },
    {
      id: 2,
      device_id: 2,
      user_id: 1,
      username: 'testuser',
      action_type: 'value_change',
      old_value: '25.0',
      new_value: '26.5',
      log_time: '2024-03-20T09:55:00Z',
      timeAgo: '5 minutes ago',
      actionDisplay: 'Value Updated',
      formattedTime: '9:55 AM'
    }
  ];

  const mockDevices = [
    {
      id: 1,
      name: 'LED Grow Lights',
      type: 'Actuator'
    },
    {
      id: 2,
      name: 'Temperature Sensor',
      type: 'Sensor'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockLocalStorage.getItem.mockReset();
    
    // Mock user data
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({ id: 1, username: 'testuser' });
      }
      if (key === 'token') {
        return 'fake-token';
      }
      return null;
    });

    // Mock successful API responses by default
    mockFetch.mockImplementation((url) => {
      if (url.includes('/devices')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDevices
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ logs: mockLogs })
      });
    });
  });

  // Unit Tests
  describe('Unit Tests', () => {
    it('renders loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<DeviceLogs />);
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
    });

    it('renders error state when API fails', async () => {
      mockFetch.mockImplementation(() => Promise.reject(new Error('API Error')));
      
      await act(async () => {
        render(<DeviceLogs />);
      });
      
      const errorText = await screen.findByTestId('chakra-text');
      expect(errorText).toHaveTextContent('Failed to fetch device logs');
      expect(screen.getByTestId('chakra-button')).toHaveTextContent('Try Again');
    });

    it('renders empty state when no logs found', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('/devices')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDevices
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ logs: [] })
        });
      });

      await act(async () => {
        render(<DeviceLogs />);
      });
      
      const emptyText = await screen.findByTestId('chakra-text');
      expect(emptyText).toHaveTextContent('No logs found');
    });

    it('shows title when showTitle prop is true', async () => {
      await act(async () => {
        render(<DeviceLogs showTitle={true} />);
      });
      
      const heading = await screen.findByTestId('chakra-heading');
      expect(heading).toHaveTextContent('Device Activity Logs');
    });

    it('hides title when showTitle prop is false', async () => {
      await act(async () => {
        render(<DeviceLogs showTitle={false} />);
      });
      
      const heading = screen.queryByTestId('chakra-heading');
      expect(heading).not.toBeInTheDocument();
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    it('fetches and displays logs successfully', async () => {
      await act(async () => {
        render(<DeviceLogs />);
      });

      const logTexts = await screen.findAllByTestId('chakra-text');
      expect(logTexts.some(text => text.textContent?.includes('LED Grow Lights'))).toBe(true);
      expect(logTexts.some(text => text.textContent?.includes('Temperature Sensor'))).toBe(true);
      expect(logTexts.some(text => text.textContent?.includes('Status Changed'))).toBe(true);
      expect(logTexts.some(text => text.textContent?.includes('Value Updated'))).toBe(true);
    });

    it('filters logs by device', async () => {
      let fetchCount = 0;
      mockFetch.mockImplementation((url) => {
        fetchCount++;
        if (url.includes('/devices')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDevices
          });
        }
        if (url.includes('device_id=1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ logs: [mockLogs[0]] })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ logs: mockLogs })
        });
      });

      await act(async () => {
        render(<DeviceLogs />);
      });

      // Wait for initial load
      const initialLogs = await screen.findAllByTestId('chakra-text');
      expect(initialLogs.some(text => text.textContent?.includes('LED Grow Lights'))).toBe(true);

      // Select device from dropdown and apply filter
      await act(async () => {
        const deviceSelect = screen.getByTestId('chakra-select');
        fireEvent.change(deviceSelect, { target: { value: '1' } });
        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);
      });

      // Verify filtered results
      const filteredLogs = await screen.findAllByTestId('chakra-text');
      expect(filteredLogs.some(text => text.textContent?.includes('LED Grow Lights'))).toBe(true);
      expect(filteredLogs.every(text => !text.textContent?.includes('Temperature Sensor'))).toBe(true);
    });

    it('handles refresh button click', async () => {
      let fetchCount = 0;
      mockFetch.mockImplementation((url) => {
        fetchCount++;
        if (url.includes('/devices')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDevices
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ logs: mockLogs })
        });
      });

      await act(async () => {
        render(<DeviceLogs />);
      });

      // Wait for initial load
      const initialLogs = await screen.findAllByTestId('chakra-text');
      expect(initialLogs.some(text => text.textContent?.includes('LED Grow Lights'))).toBe(true);

      // Click refresh button
      await act(async () => {
        const refreshButton = screen.getByText('Refresh Now');
        fireEvent.click(refreshButton);
      });

      // Wait for refresh
      await screen.findByText('LED Grow Lights');
      expect(fetchCount).toBeGreaterThan(2); // Initial load + devices + refresh
    });

    it('auto-refreshes logs every 5 seconds', async () => {
      vi.useFakeTimers();
      let fetchCount = 0;

      mockFetch.mockImplementation((url) => {
        fetchCount++;
        if (url.includes('/devices')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDevices
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ logs: [...mockLogs, { ...mockLogs[0], id: fetchCount }] })
        });
      });

      await act(async () => {
        render(<DeviceLogs />);
      });

      // Wait for initial load
      const initialLogs = await screen.findAllByTestId('chakra-text');
      expect(initialLogs.some(text => text.textContent?.includes('LED Grow Lights'))).toBe(true);

      // Fast-forward 5 seconds
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Wait for auto-refresh
      await screen.findByText('LED Grow Lights');
      expect(fetchCount).toBeGreaterThan(2); // Initial load + devices + auto-refresh

      vi.useRealTimers();
    });

    it('displays logs in compact mode', async () => {
      await act(async () => {
        render(<DeviceLogs compact={true} />);
      });

      const logContainer = await screen.findByTestId('chakra-box');
      expect(logContainer).toHaveStyle({ maxHeight: '300px' });
      expect(screen.queryByText('Refresh Now')).not.toBeInTheDocument();
    });
  });
}); 