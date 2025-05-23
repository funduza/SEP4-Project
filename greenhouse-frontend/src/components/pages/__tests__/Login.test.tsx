import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import '@testing-library/jest-dom';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  it('should render login form successfully', () => {
    renderLogin();
    
    expect(screen.getByText('Welcome to Via GreenHouse')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should redirect to dashboard after successful login', async () => {
    const mockResponse = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'eser',
        firstName: 'Eser',
        lastName: 'Sariyar',
        refCode: 'HTHCTGB8'
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'eser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'eser123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            username: 'eser',
            password: 'eser123'
          })
        })
      );
    });

    expect(mockOnLogin).toHaveBeenCalledWith(mockResponse.token, mockResponse.user);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should show error message with invalid credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wronguser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error message on empty form submission', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Username and password are required')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should be able to switch to registration form', () => {
    renderLogin();

    fireEvent.click(screen.getByText(/join via greenhouse/i));

    expect(screen.getByText('Join Via GreenHouse')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invitation code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show error when passwords do not match in registration form', async () => {
    renderLogin();

    // Switch to registration form
    fireEvent.click(screen.getByText(/join via greenhouse/i));

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'differentpass' }
    });
    fireEvent.change(screen.getByLabelText(/invitation code/i), {
      target: { value: 'INVITE123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
}); 