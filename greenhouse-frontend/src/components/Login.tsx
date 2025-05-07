import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:3000';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {

        if (!username || !password) {
          throw new Error('Username and password are required');
        }
        
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });
        

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        

        onLogin(data.token, data.user);
        

        navigate('/dashboard');
      } else {

        if (!username || !password) {
          throw new Error('Username and password are required');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        if (!inviteCode) {
          throw new Error('Invitation code is required');
        }
        
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username, 
            password, 
            firstName: firstName || null, 
            lastName: lastName || null,
            inviteCode: inviteCode || null
          })
        });
        

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        

        onLogin(data.token, data.user);
        

        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(`Could not connect to server. API URL: ${API_URL} - Please make sure the backend is running.`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: '#2c3e50'
        }}>
          {isLogin ? 'Login to Greenhouse' : 'Create an Account'}
        </h2>
        
        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="username" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: '#4b5563'
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: '#4b5563'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="confirmPassword" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="firstName" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}
                >
                  First Name (Optional)
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="lastName" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}
                >
                  Last Name (Optional)
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="inviteCode" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}
                >
                  Invitation Code (Required)
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
            </>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 
              (isLogin ? 'Logging in...' : 'Creating account...') : 
              (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontWeight: 500,
              padding: 0
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 