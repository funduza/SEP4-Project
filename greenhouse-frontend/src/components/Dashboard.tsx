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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const previousData = useRef<SensorData | null>(null);
  const refreshInterval = 10000; // Update every 10 seconds instead of 5
  const [updateCounter, setUpdateCounter] = useState<number>(0); // Counter for forcing updates
  
  // Store previous chart data to allow appending
  const chartDataRef = useRef<SensorData[]>([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  
  
  const formatTimeAgo = (seconds: number): string => {
    // If more than 60 seconds, just show "< 1 minute ago"
    if (seconds >= 60) {
      return "< 1 minute ago";
    } else {
      return `${seconds} seconds ago`;
    }
  };

  
  const updateSecondsCounter = useCallback(() => {
    if (lastUpdated) {
      const diffInSeconds = Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diffInSeconds);
    }
  }, [lastUpdated]);

  
  useEffect(() => {
    // İlk başta hemen güncelle
    updateSecondsCounter();
    
    // Sonra her 1 saniyede bir güncelle
    const timer = setInterval(() => {
      updateSecondsCounter();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [updateSecondsCounter]);

  // Add this new function to generate demo data
  const handleGenerateDemoData = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log("📊 Generating demo data...");
      const response = await fetch(`${API_URL}/api/sensors/generate-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📊 Demo data generation result:", result);
      
      // Refresh data after generation
      fetchData();
      
      // Show a brief alert
      alert(result.message || "Demo data generated successfully!");
    } catch (err) {
      console.error("Error generating demo data:", err);
      setError(err instanceof Error ? err.message : "Failed to generate demo data");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update the fetchData function to append new data rather than replace it
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      // Fetch current sensor data
      console.log("📊 Fetching current sensor data...");
      const currentResponse = await fetch(`${API_URL}/api/sensors`);
      
      if (!currentResponse.ok) {
        throw new Error(`HTTP ${currentResponse.status}`);
      }
      
      const sensorData: SensorData = await currentResponse.json();
      console.log('📊 Current sensor data:', sensorData);
      
      // Check if this is new data
      const isNewData = !previousData.current || 
        previousData.current.id !== sensorData.id ||
        previousData.current.temperature !== sensorData.temperature ||
        previousData.current.humidity !== sensorData.humidity ||
        previousData.current.prediction !== sensorData.prediction;
      
      // Update previous data reference
      previousData.current = sensorData;
      
      // Update state
      setData(sensorData);
      
      // Update last updated time if new data
      if (isNewData) {
        console.log('📊 New data detected, updating lastUpdated');
        setLastUpdated(new Date());
        setSecondsAgo(0);
        setUpdateCounter(prev => prev + 1);
      }
      
      if (sensorData._source) {
        setDataSource(sensorData._source);
      }

      // Fetch historical data
      console.log(`📊 Fetching historical data for range: ${selectedRange}...`);
      const historyResponse = await fetch(`${API_URL}/api/sensors/history?range=${selectedRange}`);
      
      if (!historyResponse.ok) {
        throw new Error(`HTTP ${historyResponse.status}`);
      }
      
      const historyData: HistoricalSensorData = await historyResponse.json();
      console.log('📊 Historical data received:', historyData.data?.length || 0, 'records');
      
      // Update historical data state
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
  }, [API_URL, selectedRange]);

  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(() => {
      console.log(`📊 Refresh interval triggered (${refreshInterval}ms)`);
      fetchData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval]);

  
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
    if (!historicalData || !historicalData.data) {
      console.log('📊 No historical data to process');
      return [];
    }
    
    console.log('📊 Processing historical data:', historicalData.data.length, 'records', 'updateCounter:', updateCounter);
    
    // Şu anki zaman
    const now = new Date();
    
    // Seçilen zaman aralığına göre saati hesapla
    let hourRange = 24; // Varsayılan
    if (selectedRange === '1h') hourRange = 1;
    if (selectedRange === '6h') hourRange = 6;
    if (selectedRange === '12h') hourRange = 12;
    if (selectedRange === '24h') hourRange = 24;
    if (selectedRange === '7d') hourRange = 24 * 7;
    if (selectedRange === '30d') hourRange = 24 * 30;
    
    // Minimum gereken zaman (şimdi - x saat)
    const minTime = new Date();
    minTime.setHours(now.getHours() - hourRange);
    
    console.log(`📊 Filtering data for range: ${selectedRange} (${hourRange} hours)`);
    console.log(`📊 Current time: ${now.toISOString()}, Min time: ${minTime.toISOString()}`);
    
    // Verileri filtrele
    const filteredData = historicalData.data
      .filter(item => {
        try {
          const date = new Date(item.timestamp);
          
          // Tarih geçerli mi?
          const isValidDate = !isNaN(date.getTime());
          
          // Seçilen zaman aralığı içinde mi?
          // Yılı kontrol etmemek için sadece saat, dakika, saniye karşılaştırması yapalım
          const normalizedItemDate = new Date(date);
          normalizedItemDate.setFullYear(now.getFullYear()); // Yılları eşitle
          
          const isInRange = normalizedItemDate >= minTime;
          
          if (isValidDate && isInRange) {
            return true;
          }
          
          return false;
        } catch (e) {
          console.error('📊 Error parsing date:', item.timestamp, e);
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
    
    console.log(`📊 Filtered data: ${filteredData.length} records remain after filtering`);
    
    // İlk ve son kayıt göster
    if (filteredData.length > 0) {
      console.log('📊 First filtered record:', filteredData[0]);
      console.log('📊 Last filtered record:', filteredData[filteredData.length - 1]);
    }
    
    return filteredData;
  }, [historicalData, selectedRange, updateCounter]); // updateCounter'ı bağımlılıklara ekle

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
        <button 
          onClick={handleGenerateDemoData}
          disabled={isGenerating}
          style={{
            backgroundColor: isGenerating ? '#cccccc' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Demo Data'}
        </button>
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
            {formatTimeAgo(secondsAgo)}
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
            key={`temp-chart-${selectedRange}-${processedData.length}`}
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
            key={`humidity-chart-${selectedRange}-${processedData.length}`}
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
