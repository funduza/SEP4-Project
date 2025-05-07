import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { LineChart } from './ui/chart';

interface SensorData {
  id?: number;
  temperature: number | string;
  humidity: number | string;
  prediction: 'Normal' | 'Alert' | 'Warning';
  timestamp: string;
  _source?: string;
}

interface HistoricalSensorData {
  data: SensorData[];
  _source?: string;
  range?: string;
  hours?: number;
}


type TimeRange = '1h' | '6h' | '12h' | '24h' | '7d' | '30d';

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}


const timeRangeOptions: TimeRangeOption[] = [
  { value: '1h', label: 'Last 1 Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' }
];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalSensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<string>('unknown');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24h');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const previousData = useRef<SensorData | null>(null);
  const refreshInterval = 30000; 

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  
  
  const formatTimeAgo = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  
  const updateSecondsCounter = useCallback(() => {
    if (lastUpdated) {
      const diffInSeconds = Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diffInSeconds);
    }
  }, [lastUpdated]);

  
  useEffect(() => {
    const timer = setInterval(() => {
      updateSecondsCounter();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [updateSecondsCounter]);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const currentResponse = await fetch(`${API_URL}/api/sensors`);
        
        if (!currentResponse.ok) {
          throw new Error(`HTTP ${currentResponse.status}`);
        }
        
        const sensorData: SensorData = await currentResponse.json();
        
        
        const isNewData = !previousData.current || 
          previousData.current.id !== sensorData.id ||
          previousData.current.temperature !== sensorData.temperature ||
          previousData.current.humidity !== sensorData.humidity ||
          previousData.current.prediction !== sensorData.prediction;
        
        
        previousData.current = data;
        
        
        setData(sensorData);
        
        
        if (isNewData) {
          setLastUpdated(new Date());
          setSecondsAgo(0);
        }
        
        if (sensorData._source) {
          setDataSource(sensorData._source);
        }

        const historyResponse = await fetch(`${API_URL}/api/sensors/history?range=${selectedRange}`);
        
        if (!historyResponse.ok) {
          throw new Error(`HTTP ${historyResponse.status}`);
        }
        
        const historyData: HistoricalSensorData = await historyResponse.json();
        setHistoricalData(historyData);
        
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setIsLoading(false);
      }
    };

    
    fetchData();
    
    
    const intervalId = setInterval(fetchData, refreshInterval);
    
    
    return () => clearInterval(intervalId);
  }, [API_URL, selectedRange, data]); 

  
  const getValueStyle = (key: 'temperature' | 'humidity') => {
    
    if (!previousData.current || !data) {
      return {};
    }

    
    const prevValue = ensureNumber(previousData.current[key]);
    const currentValue = ensureNumber(data[key]);
    
    
    if (prevValue === currentValue) {
      return {};
    }
    
    
    return {
      animation: 'highlight 2s ease-out',
      backgroundColor: prevValue < currentValue ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)'
    };
  };

  
  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRange(e.target.value as TimeRange);
  };

  
  const ensureNumber = (value: string | number): number => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  };

  
  const getDateRangeText = (): string => {
    if (!historicalData || !historicalData.hours) return '';
    
    try {
      const now = new Date();
      const start = new Date(now);
      start.setHours(now.getHours() - (historicalData.hours || 24));
      
      if (selectedRange === '1h' || selectedRange === '6h' || selectedRange === '12h' || selectedRange === '24h') {
        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      }
    } catch (error) {
      return '';
    }
  };

  
  const processedData = useMemo(() => {
    if (!historicalData || !historicalData.data) return [];
    
    return historicalData.data
      .filter(item => {
        
        try {
          const date = new Date(item.timestamp);
          return !isNaN(date.getTime());
        } catch (e) {
          return false;
        }
      })
      .map(item => ({
        ...item,
        temperature: ensureNumber(item.temperature),
        humidity: ensureNumber(item.humidity),
        
        timestampMs: new Date(item.timestamp).getTime()
      }))
      .sort((a, b) => a.timestampMs - b.timestampMs);
  }, [historicalData]);

  if (error) {
    return (
      <div className="App" style={{ 
        padding: 20,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <h1 style={{ 
          color: '#2c3e50',
          borderBottom: '2px solid #eaecef',
          paddingBottom: '10px',
          marginBottom: '30px'
        }}>Greenhouse Monitoring Dashboard</h1>
        <div style={{ 
          padding: '20px', 
          borderRadius: '12px', 
          backgroundColor: '#fff1f2', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #ffebeb'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
          <p>Please make sure the backend server is running at {API_URL}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !data || !historicalData) {
    return (
      <div className="App" style={{ 
        padding: 20,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <h1 style={{ 
          color: '#2c3e50',
          borderBottom: '2px solid #eaecef',
          paddingBottom: '10px',
          marginBottom: '30px'
        }}>Greenhouse Monitoring Dashboard</h1>
        <p>Loading sensor data...</p>
      </div>
    );
  }

  return (
    <div className="App" style={{ 
      padding: 20,
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <style>
        {`
          @keyframes highlight {
            0% { background-color: rgba(46, 204, 113, 0.3); }
            100% { background-color: transparent; }
          }
        `}
      </style>
      
      <h1 style={{ 
        color: '#2c3e50',
        borderBottom: '2px solid #eaecef',
        paddingBottom: '10px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Greenhouse Monitoring Dashboard
      </h1>
      
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ 
          color: '#3498db',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          Current Sensor Data 
          <small style={{ 
            color: '#7f8c8d', 
            fontSize: '0.7em',
            backgroundColor: '#ecf0f1',
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            {dataSource} source
          </small>
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            backgroundColor: '#f0f9ff', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            minWidth: '200px',
            flex: 1,
            transition: 'transform 0.2s, background-color 0.5s',
            cursor: 'pointer',
            border: '1px solid #e1f0ff',
            ...getValueStyle('temperature')
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0366d6' }}>Temperature</h3>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              margin: 0,
              color: ensureNumber(data?.temperature || 0) > 27 ? '#e74c3c' : 
                     ensureNumber(data?.temperature || 0) < 20 ? '#3498db' : '#2ecc71'
            }}>
              {ensureNumber(data?.temperature || 0).toFixed(1)}&deg;C
            </p>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '12px', 
              color: '#7f8c8d' 
            }}>
              Ideal range: 18-30°C
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            backgroundColor: '#f0fff4', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            minWidth: '200px',
            flex: 1,
            transition: 'transform 0.2s, background-color 0.5s',
            cursor: 'pointer',
            border: '1px solid #e1ffe1',
            ...getValueStyle('humidity')
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>Humidity</h3>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              margin: 0,
              color: ensureNumber(data?.humidity || 0) > 65 ? '#e74c3c' : 
                     ensureNumber(data?.humidity || 0) < 50 ? '#3498db' : '#2ecc71'
            }}>
              {ensureNumber(data?.humidity || 0).toFixed(1)}%
            </p>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '12px', 
              color: '#7f8c8d' 
            }}>
              Ideal range: 45-70%
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            backgroundColor: data?.prediction === 'Normal' ? '#f0fff4' : 
                             data?.prediction === 'Warning' ? '#fffbeb' : '#fff1f2', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            minWidth: '200px',
            flex: 1,
            transition: 'transform 0.2s, background-color 0.5s',
            cursor: 'pointer',
            border: data?.prediction === 'Normal' ? '1px solid #e1ffe1' : 
                   data?.prediction === 'Warning' ? '1px solid #ffeeba' : '1px solid #ffebeb'
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0',
              color: data?.prediction === 'Normal' ? '#27ae60' : 
                     data?.prediction === 'Warning' ? '#f39c12' : '#e74c3c'
            }}>Status</h3>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              margin: 0,
              color: data?.prediction === 'Normal' ? '#27ae60' : 
                     data?.prediction === 'Warning' ? '#f39c12' : '#e74c3c'
            }}>
              {data?.prediction || 'Loading...'}
            </p>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '12px', 
              color: '#7f8c8d' 
            }}>
              {data?.prediction === 'Normal' ? 'All parameters within range' : 
               data?.prediction === 'Warning' ? 'Some parameters near threshold' : 
               data?.prediction === 'Alert' ? 'Action required' : 'Loading...'}
            </p>
          </div>
        </div>
        
        <p style={{ 
          color: '#7f8c8d',
          fontSize: '14px',
          textAlign: 'right',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '8px'
        }}>
          Last updated: {data ? new Date(data.timestamp).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) : 'Loading...'}
          <span style={{ 
            fontSize: '12px',
            color: '#3498db',
            backgroundColor: '#e1f0ff',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {formatTimeAgo(secondsAgo)} ago
          </span>
        </p>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        marginBottom: '30px',
        border: '1px solid #eaecef'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: '#3498db',
            fontSize: '1.5rem',
            margin: 0
          }}>Historical Data</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="timeRange" style={{ color: '#7f8c8d', fontWeight: 500 }}>Time Range:</label>
            <select
              id="timeRange"
              value={selectedRange}
              onChange={handleRangeChange}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #dcdfe6',
                fontSize: '14px',
                color: '#606266',
                backgroundColor: '#f5f7fa',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s'
              }}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {processedData.length > 0 && (
          <p style={{ 
            marginBottom: '20px',
            color: '#7f8c8d',
            fontSize: '14px',
            backgroundColor: '#f8f9fa',
            padding: '8px 12px',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            Showing data from: <strong>{getDateRangeText()}</strong> 
            ({processedData.length} data points)
          </p>
        )}
        
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            color: '#2c3e50',
            fontSize: '1.2rem',
            borderBottom: '1px solid #eaecef',
            paddingBottom: '8px'
          }}>Temperature Trend</h3>
          <LineChart 
            data={processedData} 
            xAxisKey="timestamp" 
            yAxisKeys={[{ key: 'temperature', color: '#ff6b6b', name: 'Temperature (°C)' }]}
            height={300}
            formatXAxis={(value: string) => {
              try {
                const date = new Date(value);
                if (selectedRange === '1h' || selectedRange === '6h' || selectedRange === '12h' || selectedRange === '24h') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
              } catch (e) {
                return '';
              }
            }}
          />
        </div>
        
        <div>
          <h3 style={{ 
            color: '#2c3e50',
            fontSize: '1.2rem',
            borderBottom: '1px solid #eaecef',
            paddingBottom: '8px'
          }}>Humidity Trend</h3>
          <LineChart 
            data={processedData} 
            xAxisKey="timestamp" 
            yAxisKeys={[{ key: 'humidity', color: '#4dabf7', name: 'Humidity (%)' }]}
            height={300}
            formatXAxis={(value: string) => {
              try {
                const date = new Date(value);
                if (selectedRange === '1h' || selectedRange === '6h' || selectedRange === '12h' || selectedRange === '24h') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
              } catch (e) {
                return '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
