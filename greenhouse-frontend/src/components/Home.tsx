import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="App" style={{ padding: 20, textAlign: 'center' }}>
      <h1>Greenhouse Monitoring System</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Welcome to the Greenhouse Monitoring System. This application allows you to monitor temperature,
        humidity, and environmental conditions in your greenhouse.
      </p>

      <div style={{ 
        padding: '30px', 
        maxWidth: '600px',
        margin: '0 auto',
        borderRadius: '8px',
        backgroundColor: '#f0f9ff',
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Navigate to Dashboard</h2>
        <p>View real-time sensor data and historical trends</p>
        <Link 
          to="/demo" 
          style={{ 
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            marginTop: '15px',
            fontWeight: 'bold'
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Home;
