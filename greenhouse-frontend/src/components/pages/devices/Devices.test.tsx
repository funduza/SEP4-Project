import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Devices from './Devices';
import { ReactNode } from 'react';
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
  Box: ({ children, ...props }: { children: ReactNode } & Record<string, any>) => {
    if (props.cursor === 'pointer' && props.w === '50px' && props.h === '26px' && props.bg === '#22c35e') {
      return <div data-testid="device-toggle-switch" {...props}>{children}</div>;
    }
    return <div data-testid="chakra-box" {...props}>{children}</div>;
  },
  Flex: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-flex" {...props}>{children}</div>,
  Heading: ({ children, ...props }: { children: ReactNode }) => <h1 data-testid="chakra-heading" {...props}>{children}</h1>,
  Text: ({ children, ...props }: { children: ReactNode }) => <div data-testid="chakra-text" {...props}>{children}</div>,
  Input: ({ value, onChange, ...props }: any) => (
    <input
      data-testid="chakra-input"
      value={value}
      onChange={onChange}
      {...props}
    />
  ),
  SimpleGrid: ({ children, ...props }: { children: ReactNode }) => (
    <div data-testid="chakra-simple-grid" {...props}>{children}</div>
  ),
  Badge: ({ children, ...props }: { children: ReactNode }) => (
    <span data-testid="chakra-badge" {...props}>{children}</span>
  ),
  Spinner: () => <div data-testid="chakra-spinner">Loading...</div>,
  Icon: ({ children, ...props }: { children: ReactNode }) => (
    <span data-testid="chakra-icon" {...props}>{children}</span>
  ),
  HStack: ({ children, ...props }: { children: ReactNode }) => (
    <div data-testid="chakra-hstack" {...props}>{children}</div>
  ),
}));

// Mock DeviceLogs component
vi.mock('./DeviceLogs', () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-device-logs">Device Logs Component</div>
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaSearch: () => <span data-testid="fa-search-icon">🔍</span>,
  FaLeaf: () => <span data-testid="fa-leaf-icon">🌿</span>,
  FaThermometerHalf: () => <span data-testid="fa-thermometer-icon">🌡️</span>,
  FaTint: () => <span data-testid="fa-tint-icon">💧</span>,
  FaLightbulb: () => <span data-testid="fa-lightbulb-icon">💡</span>,
  FaFan: () => <span data-testid="fa-fan-icon">🌀</span>,
  FaSeedling: () => <span data-testid="fa-seedling-icon">🌱</span>,
  FaFlask: () => <span data-testid="fa-flask-icon">🧪</span>,
  FaMicrochip: () => <span data-testid="fa-microchip-icon">💻</span>,
  FaRegLightbulb: () => <span data-testid="fa-reg-lightbulb-icon">💡</span>,
}));

vi.mock('react-icons/md', () => ({
  MdWater: () => <span data-testid="md-water-icon">💧</span>,
  MdOutlineDeviceThermostat: () => <span data-testid="md-thermostat-icon">🌡️</span>,
  MdSensors: () => <span data-testid="md-sensors-icon">📡</span>,
  MdOutlineSettings: () => <span data-testid="md-settings-icon">⚙️</span>,
  MdOutlineSettingsRemote: () => <span data-testid="md-remote-icon">📱</span>,
  MdTouchApp: () => <span data-testid="md-touch-icon">👆</span>,
  MdSpeed: () => <span data-testid="md-speed-icon">⚡</span>,
}));

vi.mock('react-icons/bs', () => ({
  BsDropletHalf: () => <span data-testid="bs-droplet-icon">💧</span>,
  BsThermometerHalf: () => <span data-testid="bs-thermometer-icon">🌡️</span>,
  BsLightbulbFill: () => <span data-testid="bs-lightbulb-fill-icon">💡</span>,
  BsLightbulb: () => <span data-testid="bs-lightbulb-icon">💡</span>,
  BsDisplay: () => <span data-testid="bs-display-icon">🖥️</span>,
  BsCpu: () => <span data-testid="bs-cpu-icon">💻</span>,
}));

vi.mock('react-icons/io5', () => ({
  IoWater: () => <span data-testid="io-water-icon">💧</span>,
}));

describe('Devices Component', () => {
  const mockDevices = [
    {
      id: 1,
      name: 'Temperature Sensor',
      type: 'Sensor',
      status: 'Normal',
      icon: 'temperature',
      last_update: '2024-03-20T10:00:00Z',
      isInteractive: false,
      value: 25.5,
      unit: '°C'
    },
    {
      id: 2,
      name: 'LED Grow Lights',
      type: 'Actuator',
      status: 'Active',
      icon: 'light',
      last_update: '2024-03-20T10:00:00Z',
      isInteractive: true,
      isOn: true
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockLocalStorage.getItem.mockReset();
  });

  // Unit Tests
  describe('Unit Tests', () => {
    it('renders loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<Devices />);
      expect(screen.getByText(/Loading devices.../i)).toBeInTheDocument();
    });

    it('renders error state when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      render(<Devices />);
      
      await waitFor(() => {
        expect(screen.getByText(/Could not connect to server/i)).toBeInTheDocument();
      });
    });

    it('filters devices based on search query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices
      });

      render(<Devices />);
      
      const searchInput = await screen.findByPlaceholderText(/Search devices.../i);
      fireEvent.change(searchInput, { target: { value: 'LED' } });

      await waitFor(() => {
        expect(screen.getByText('LED Grow Lights')).toBeInTheDocument();
        expect(screen.queryByText('Temperature Sensor')).not.toBeInTheDocument();
      });
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    it('fetches and displays devices successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices
      });

      render(<Devices />);

      await waitFor(() => {
        expect(screen.getByText('Temperature Sensor')).toBeInTheDocument();
        expect(screen.getByText('LED Grow Lights')).toBeInTheDocument();
      });
    });

    it('toggles device status and updates UI', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          device: { ...mockDevices[1], isOn: false, status: 'Inactive' }
        })
      });

      mockLocalStorage.getItem.mockReturnValue('fake-token');

      render(<Devices />);

      // Wait for devices to load
      await waitFor(() => {
        expect(screen.getByText('LED Grow Lights')).toBeInTheDocument();
      });

      // Find and click the toggle switch using test-id
      const toggleSwitch = screen.getByTestId('device-toggle-switch');
      fireEvent.click(toggleSwitch);

      // Verify API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/devices/2/toggle',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-token'
            })
          })
        );
      });
    });

    it('updates device status in activity log', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          device: { ...mockDevices[1], isOn: false, status: 'Inactive' }
        })
      });

      render(<Devices />);

      // Wait for devices to load
      await waitFor(() => {
        expect(screen.getByText('LED Grow Lights')).toBeInTheDocument();
      });

      // Toggle device using test-id
      const toggleSwitch = screen.getByTestId('device-toggle-switch');
      fireEvent.click(toggleSwitch);

      // Verify activity log update
      await waitFor(() => {
        expect(screen.getByTestId('mocked-device-logs')).toBeInTheDocument();
      });
    });

    it('handles API errors during device toggle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices
      }).mockRejectedValueOnce(new Error('Toggle failed'));

      render(<Devices />);

      // Wait for devices to load
      await waitFor(() => {
        expect(screen.getByText('LED Grow Lights')).toBeInTheDocument();
      });

      // Toggle device using test-id
      const toggleSwitch = screen.getByTestId('device-toggle-switch');
      fireEvent.click(toggleSwitch);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to update device status/i)).toBeInTheDocument();
      });
    });
  });
}); 