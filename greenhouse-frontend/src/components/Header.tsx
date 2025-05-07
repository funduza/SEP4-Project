import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, onLogout }) => {
  const location = useLocation();
  
  return (
    <header style={{
      backgroundColor: '#f8f9fa',
      padding: '10px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#333',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            Greenhouse Monitoring
          </Link>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            textDecoration: 'none',
            color: location.pathname === '/' ? '#4CAF50' : '#333',
            fontWeight: location.pathname === '/' ? 'bold' : 'normal'
          }}>
            Home
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" style={{
                textDecoration: 'none',
                color: location.pathname === '/dashboard' ? '#4CAF50' : '#333',
                fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal'
              }}>
                Dashboard
              </Link>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '20px',
                paddingLeft: '20px',
                borderLeft: '1px solid #ddd'
              }}>
                <span style={{ 
                  color: '#666',
                  fontSize: '14px'
                }}>
                  Welcome, <strong>{username}</strong>
                </span>
                
                <button 
                  onClick={onLogout}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" style={{
              textDecoration: 'none',
              color: location.pathname === '/login' ? '#4CAF50' : '#333',
              fontWeight: location.pathname === '/login' ? 'bold' : 'normal'
            }}>
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
