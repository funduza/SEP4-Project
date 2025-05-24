import { describe, it, expect } from 'vitest';
import {
  PredictionData,
  Range,
  Ranges,
  TimeRangeOption,
  SensorType,
  Insight,
  ChartDataItem
} from './types';

describe('Types', () => {
  it('PredictionData type can be instantiated correctly', () => {
    const data: PredictionData = {
      id: 1,
      predicted_temp: 25.5,
      predicted_air_humidity: 60,
      predicted_soil_humidity: 55,
      predicted_co2_level: 800,
      predicted_light_lux: 1200,
      timestamp: '2023-05-10T10:00:00Z',
      parsedDate: new Date('2023-05-10T10:00:00Z'),
      ms: 1683712800000
    };
    
    expect(data.id).toBe(1);
    expect(data.predicted_temp).toBe(25.5);
    expect(data.predicted_air_humidity).toBe(60);
    expect(data.predicted_soil_humidity).toBe(55);
    expect(data.predicted_co2_level).toBe(800);
    expect(data.predicted_light_lux).toBe(1200);
    expect(data.timestamp).toBe('2023-05-10T10:00:00Z');
    expect(data.parsedDate).toBeInstanceOf(Date);
    expect(data.ms).toBe(1683712800000);
  });
  
  it('Range type can be instantiated correctly', () => {
    const range: Range = {
      min: 20,
      max: 30,
      ideal: { min: 22, max: 28 }
    };
    
    expect(range.min).toBe(20);
    expect(range.max).toBe(30);
    expect(range.ideal.min).toBe(22);
    expect(range.ideal.max).toBe(28);
  });
  
  it('Ranges type can be instantiated correctly', () => {
    const ranges: Ranges = {
      temp: { min: 15, max: 35, ideal: { min: 22, max: 28 } },
      air_humidity: { min: 35, max: 75, ideal: { min: 50, max: 65 } },
      soil_humidity: { min: 30, max: 70, ideal: { min: 45, max: 60 } },
      co2_level: { min: 400, max: 1500, ideal: { min: 700, max: 1200 } },
      light_lux: { min: 0, max: 2000, ideal: { min: 800, max: 1800 } }
    };
    
    expect(ranges.temp.min).toBe(15);
    expect(ranges.air_humidity.ideal.min).toBe(50);
    expect(ranges.soil_humidity.max).toBe(70);
    expect(ranges.co2_level.ideal.max).toBe(1200);
    expect(ranges.light_lux.min).toBe(0);
  });
  
  it('TimeRangeOption type can be instantiated correctly', () => {
    const option: TimeRangeOption = {
      value: '24h',
      label: 'Next 24 Hours'
    };
    
    expect(option.value).toBe('24h');
    expect(option.label).toBe('Next 24 Hours');
  });
  
  it('SensorType type can be instantiated correctly', () => {
    const sensorType: SensorType = {
      id: 'temp',
      label: 'Temperature',
      unit: '°C',
      color: '#ff6b6b'
    };
    
    expect(sensorType.id).toBe('temp');
    expect(sensorType.label).toBe('Temperature');
    expect(sensorType.unit).toBe('°C');
    expect(sensorType.color).toBe('#ff6b6b');
  });
  
  it('Insight type can be instantiated correctly', () => {
    const insight: Insight = {
      type: 'warning',
      icon: '🌡️',
      message: 'Temperature is too high',
      sensor: 'temp'
    };
    
    expect(insight.type).toBe('warning');
    expect(insight.icon).toBe('🌡️');
    expect(insight.message).toBe('Temperature is too high');
    expect(insight.sensor).toBe('temp');
  });
  
  it('ChartDataItem type can be instantiated correctly', () => {
    const item: ChartDataItem = {
      timestamp: '2023-05-10T10:00:00Z',
      date: new Date('2023-05-10T10:00:00Z'),
      temp: 25.5,
      air_humidity: 60
    };
    
    expect(item.timestamp).toBe('2023-05-10T10:00:00Z');
    expect(item.date).toBeInstanceOf(Date);
    expect(item.temp).toBe(25.5);
    expect(item.air_humidity).toBe(60);
  });
}); 