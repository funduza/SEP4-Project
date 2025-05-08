import sensorModel, { SensorData } from '../models/sensorModel';

class DataGeneratorService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private intervalSeconds = 30;
  private isGenerating = false; // Flag to prevent multiple simultaneous generations
  
  // Min/max values for random data generation
  private tempMin = 18;
  private tempMax = 30;
  private humidityMin = 45;
  private humidityMax = 70;
  
  // Keep track of the last values to make small incremental changes
  private lastTemp = 23;
  private lastHumidity = 55;
  
  /**
   * Generate a random sensor reading with realistic changes from previous values
   */
  private generateSensorReading(): SensorData {
    console.log('Generating new sensor reading...');
    
    // Generate a small change from the last temperature (-1 to +1 degrees)
    const tempChange = (Math.random() * 2 - 1) * 0.5;
    // Generate a small change from the last humidity (-2 to +2 percent)
    const humidityChange = (Math.random() * 4 - 2);
    
    // Calculate new values with the small change
    let newTemp = this.lastTemp + tempChange;
    let newHumidity = this.lastHumidity + humidityChange;
    
    // Make sure values stay within the min/max range
    newTemp = Math.min(Math.max(newTemp, this.tempMin), this.tempMax);
    newHumidity = Math.min(Math.max(newHumidity, this.humidityMin), this.humidityMax);
    
    // Update the last values
    this.lastTemp = newTemp;
    this.lastHumidity = newHumidity;
    
    // Determine the prediction based on temperature and humidity
    let prediction: 'Normal' | 'Warning' | 'Alert' = 'Normal';
    if (newTemp > 27 || newHumidity > 65) {
      prediction = 'Warning';
    }
    if (newTemp > 28.5 || newHumidity > 68) {
      prediction = 'Alert';
    }
    
    // Generate a timestamp with hard-coded 2023 year
    const now = new Date();
    const year = 2023;
    const month = now.getMonth();
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Create timestamp string in ISO format with year set to 2023
    const timestamp = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.000Z`;
    
    console.log('Generated timestamp:', timestamp);
    
    const sensorData = {
      temperature: Number(newTemp.toFixed(1)),
      humidity: Number(newHumidity.toFixed(1)),
      prediction,
      timestamp
    };
    
    console.log('Generated sensor data:', sensorData);
    return sensorData;
  }
  
  /**
   * Save a new sensor reading to the database
   */
  private async saveReading() {
    // Prevent multiple simultaneous data generations
    if (this.isGenerating) {
      console.log('Already generating data, skipping this cycle');
      return;
    }
    
    console.log('Starting to save new sensor reading...');
    this.isGenerating = true;
    
    try {
      const sensorData = this.generateSensorReading();
      console.log('Attempting to save to database...');
      const insertId = await sensorModel.saveSensorData(sensorData);
      console.log('Successfully saved sensor data with ID:', insertId);
    } catch (error) {
      console.error('Error generating and saving sensor data:', error);
    } finally {
      this.isGenerating = false;
    }
  }
  
  /**
   * Start the data generator service
   */
  start() {
    if (this.isRunning) {
      console.log('Data generator already running');
      return;
    }
    
    console.log('Starting data generator service');
    this.isRunning = true;
    
    // Generate data immediately on start
    this.saveReading();
    
    // Then set up an interval for regular data generation
    this.intervalId = setInterval(() => {
      console.log('Timer triggered, generating new data...');
      this.saveReading();
    }, this.intervalSeconds * 1000);
    
    console.log(`Data generator scheduled to run every ${this.intervalSeconds} seconds`);
  }
  
  /**
   * Stop the data generator service
   */
  stop() {
    if (!this.isRunning || !this.intervalId) {
      console.log('Data generator not running');
      return;
    }
    
    console.log('Stopping data generator service');
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
  }
  
  /**
   * Generate a single reading on demand
   */
  generateOnDemand() {
    console.log('Generating data on demand');
    return this.saveReading();
  }
}

export default new DataGeneratorService();
