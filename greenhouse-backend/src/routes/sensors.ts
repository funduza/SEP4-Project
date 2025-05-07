import express from 'express';
import sensorController from '../controllers/sensorController';

const router = express.Router();

// Get current sensor data
router.get('/', sensorController.getCurrentData);

// Get historical sensor data
router.get('/history', sensorController.getHistoricalData);

// Create new sensor reading
router.post('/', sensorController.createSensorData);

export default router;
