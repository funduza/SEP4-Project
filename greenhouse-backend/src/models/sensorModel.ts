import pool from '../config/db';

export interface SensorData {
  id?: number;
  temperature: number;
  humidity: number;
  prediction: 'Normal' | 'Alert' | 'Warning';
  timestamp: string;
}

class SensorModel {

  async getCurrentData(): Promise<SensorData> {
    const [rows] = await pool.query(
      'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1'
    );
    return (rows as SensorData[])[0];
  }


  async getHistoricalData(hours = 24, limit = 100): Promise<SensorData[]> {

    const [rows] = await pool.query(
      `SELECT * FROM sensor_data 
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR) 
       ORDER BY timestamp DESC
       LIMIT ?`,
      [hours, limit]
    );
    

    const data = rows as SensorData[];
    

    const sortedData = [...data].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    return sortedData;
  }


  private downsampleData(data: SensorData[], targetPoints: number): SensorData[] {
    if (data.length <= targetPoints) {
      return data;
    }
    

    const step = Math.max(1, Math.floor(data.length / targetPoints));
    

    const sampledData: SensorData[] = [];
    

    sampledData.push(data[0]);
    

    for (let i = step; i < data.length - step; i += step) {
      sampledData.push(data[i]);
    }
    

    if (sampledData[sampledData.length - 1] !== data[data.length - 1]) {
      sampledData.push(data[data.length - 1]);
    }
    
    return sampledData;
  }


  async saveSensorData(data: SensorData): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO sensor_data (temperature, humidity, prediction, timestamp) VALUES (?, ?, ?, ?)',
      [data.temperature, data.humidity, data.prediction, data.timestamp || new Date().toISOString()]
    );
    return (result as any).insertId;
  }
}

export default new SensorModel();
