import { Request, Response } from 'express';
import sensorModel, { SensorData } from '../models/sensorModel';


const mockCurrentData: SensorData = {
  id: 1,
  temperature: 24.5,
  humidity: 56.8,
  prediction: 'Normal',
  timestamp: new Date().toISOString()
};

const generateMockHistoricalData = (count = 24): SensorData[] => {
  const data: SensorData[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - (count - 1 - i));
    
    data.push({
      id: i + 1,
      temperature: 20 + Math.random() * 10,
      humidity: 45 + Math.random() * 25,
      prediction: Math.random() > 0.7 ? 'Warning' : (Math.random() > 0.9 ? 'Alert' : 'Normal'),
      timestamp: timestamp.toISOString()
    });
  }
  
  return data;
};


function downsampleData(data: SensorData[], targetCount: number): SensorData[] {
  if (data.length <= targetCount) {
    return data;
  }
  
  const result: SensorData[] = [];
  const step = data.length / targetCount;
  
  for (let i = 0; i < targetCount; i++) {
    const index = Math.min(Math.floor(i * step), data.length - 1);
    result.push(data[index]);
  }
  

  if (result[result.length - 1] !== data[data.length - 1]) {
    result[result.length - 1] = data[data.length - 1];
  }
  
  return result;
}

class SensorController {

  async getCurrentData(req: Request, res: Response) {
    try {
      let sensorData: SensorData;
      let source = 'database';
      
      try {
        sensorData = await sensorModel.getCurrentData();
        
        if (!sensorData) {
          throw new Error('No data available in database');
        }
      } catch (dbError) {
        source = 'mock';
        sensorData = mockCurrentData;
      }
      
      res.status(200).json({
        ...sensorData,
        _source: source
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching sensor data' });
    }
  }


  async getHistoricalData(req: Request, res: Response) {
    try {

      const range = (req.query.range as string) || '24h';
      let hours = 24; // Default to 24 hours
      

      switch (range) {
        case '1h':
          hours = 1;
          break;
        case '6h':
          hours = 6;
          break;
        case '12h':
          hours = 12;
          break;
        case '24h':
          hours = 24;
          break;
        case '7d':
          hours = 24 * 7;
          break;
        case '30d':
          hours = 24 * 30;
          break;
        default:
          hours = 24;
      }
      

      const limit = parseInt(req.query.limit as string) || 100;
      
      let sensorData: SensorData[];
      let source = 'database';
      
      try {
        sensorData = await sensorModel.getHistoricalData(hours, limit);
        
        if (!sensorData || sensorData.length === 0) {
          throw new Error('No historical data available in database');
        }
      } catch (dbError) {
        source = 'mock';
        sensorData = generateMockHistoricalData(Math.min(hours, 100));
      }
      

      const sortedData = sensorData.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA.getTime() - dateB.getTime();
      });
      

      let finalData = sortedData;
      if (sortedData.length > limit) {
        finalData = downsampleData(sortedData, limit);
      }
      

      res.status(200).json({ 
        data: finalData,
        range,
        hours,
        count: finalData.length,
        _source: source
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching historical data' });
    }
  }


  async createSensorData(req: Request, res: Response) {
    try {
      const sensorData: SensorData = req.body;
      let insertId: number;
      let source = 'database';
      
      try {
        insertId = await sensorModel.saveSensorData(sensorData);
      } catch (dbError) {
        source = 'mock';
        insertId = Math.floor(Math.random() * 1000);
      }
      

      res.status(201).json({ 
        id: insertId, 
        ...sensorData,
        _source: source
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error saving sensor data' });
    }
  }
}

export default new SensorController();
