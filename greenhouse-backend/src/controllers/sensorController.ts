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

  async generateDemoData(req: Request, res: Response) {
    try {
      // Clear existing data first
      await sensorModel.clearAllData();

      const daysToGenerate = 30;
      const intervalSeconds = 30;
      const totalRecords = (daysToGenerate * 24 * 60 * 60) / intervalSeconds;
      
      console.log(`Generating ${totalRecords} demo records spanning ${daysToGenerate} days...`);
      
      // Start from 30 days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToGenerate);
      startDate.setFullYear(2023); // Force year to be 2023
      
      // Initialize with reasonable values
      let currentTemp = 23.5;
      let currentHumidity = 55.0;
      let recordsGenerated = 0;
      
      // Create a batch insert function to improve performance
      const batchSize = 1000;
      let batch: SensorData[] = [];
      
      // Generate data points
      for (let i = 0; i < totalRecords; i++) {
        // Calculate timestamp for this record
        const timestamp = new Date(startDate.getTime() + (i * intervalSeconds * 1000));
        
        // Add some variability to temperature and humidity
        // More realistic changes: daily cycles, weekly patterns
        
        // Daily cycle: temperatures higher during day, lower at night
        const hourOfDay = timestamp.getHours();
        const dayFactor = Math.sin((hourOfDay - 6) * Math.PI / 12); // Peak at noon, lowest at midnight
        
        // Weekly pattern: slightly warmer on weekends
        const dayOfWeek = timestamp.getDay(); // 0 = Sunday, 6 = Saturday
        const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.5 : 0;
        
        // Random variation
        const tempChange = (Math.random() * 2 - 1) * 0.3; // Small random fluctuation
        const humidityChange = (Math.random() * 4 - 2) * 0.5; // Larger fluctuation for humidity
        
        // Calculate new values
        currentTemp += tempChange + (dayFactor * 1.5) + (weekendFactor * 0.5);
        currentHumidity += humidityChange - (dayFactor * 0.8); // Humidity tends to be inverse of temperature
        
        // Keep values within realistic bounds
        currentTemp = Math.min(Math.max(currentTemp, 18), 30);
        currentHumidity = Math.min(Math.max(currentHumidity, 45), 70);
        
        // Determine prediction based on temperature and humidity
        let prediction: 'Normal' | 'Warning' | 'Alert' = 'Normal';
        if (currentTemp > 27 || currentHumidity > 65) {
          prediction = 'Warning';
        }
        if (currentTemp > 28.5 || currentHumidity > 68) {
          prediction = 'Alert';
        }
        
        // Create the sensor data record
        const sensorData: SensorData = {
          temperature: Number(currentTemp.toFixed(1)),
          humidity: Number(currentHumidity.toFixed(1)),
          prediction,
          timestamp: timestamp.toISOString()
        };
        
        batch.push(sensorData);
        
        // Save batch when it reaches the batch size
        if (batch.length >= batchSize) {
          await sensorModel.saveSensorDataBatch(batch);
          recordsGenerated += batch.length;
          batch = [];
          console.log(`Generated ${recordsGenerated} records so far...`);
        }
      }
      
      // Save any remaining records
      if (batch.length > 0) {
        await sensorModel.saveSensorDataBatch(batch);
        recordsGenerated += batch.length;
      }
      
      res.status(200).json({
        success: true,
        message: `Successfully generated ${recordsGenerated} demo records spanning ${daysToGenerate} days`
      });
    } catch (error) {
      console.error('Error generating demo data:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error generating demo data' 
      });
    }
  }
}

export default new SensorController();
