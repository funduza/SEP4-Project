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
    console.log(`Fetching historical data for last ${hours} hours, limit: ${limit}`);

    // Daha basit sorgu: sadece en son verileri LIMIT ile alalım ve saatlere göre filtrelemeyi frontend'de yapalım
    const [rows] = await pool.query(
      `SELECT * FROM sensor_data 
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    );
    
    console.log(`Retrieved ${(rows as any[]).length} historical records`);
    const data = rows as SensorData[];
    
    // Debug first few records
    if (data.length > 0) {
      console.log('First record timestamp:', data[0].timestamp);
      if (data.length > 1) {
        console.log('Last record timestamp:', data[data.length - 1].timestamp);
      }
    }

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

  /**
   * Save multiple sensor data records in a batch for better performance
   */
  async saveSensorDataBatch(dataList: SensorData[]): Promise<number> {
    if (dataList.length === 0) {
      return 0;
    }
    
    // Create the values part of the query for multiple inserts
    const placeholders = dataList.map(() => '(?, ?, ?, ?)').join(', ');
    const values = dataList.flatMap(data => [
      data.temperature, 
      data.humidity, 
      data.prediction, 
      data.timestamp || new Date().toISOString()
    ]);
    
    const query = `INSERT INTO sensor_data (temperature, humidity, prediction, timestamp) VALUES ${placeholders}`;
    
    const [result] = await pool.query(query, values);
    
    return (result as any).affectedRows || 0;
  }

  /**
   * Clear all sensor data from the database
   */
  async clearAllData(): Promise<number> {
    try {
      const [result] = await pool.query('DELETE FROM sensor_data');
      return (result as any).affectedRows || 0;
    } catch (error) {
      console.error('Error clearing sensor data:', error);
      throw error;
    }
  }
}

export default new SensorModel();
