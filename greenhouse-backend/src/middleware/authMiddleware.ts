import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();


const JWT_SECRET: Secret = process.env.JWT_SECRET || 'greenhouse-secret-key';


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided' 
    });
  }

  try {

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token'
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }


  if (req.user.username === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required' 
    });
  }
}; 