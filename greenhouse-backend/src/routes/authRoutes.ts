import express, { Request, Response } from 'express';
import authController from '../controllers/authController';

const router = express.Router();

// Bind controller methods properly
const loginHandler = async (req: Request, res: Response) => {
  await authController.login(req, res);
};

const registerHandler = async (req: Request, res: Response) => {
  await authController.register(req, res);
};

const verifyHandler = async (req: Request, res: Response) => {
  await authController.verifyToken(req, res);
};

// Auth routes
router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.get('/verify', verifyHandler);

export default router; 