import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import userModel from '../models/userModel';
import dotenv from 'dotenv';
import { User } from '../models/userModel';


dotenv.config();


const JWT_SECRET: Secret = process.env.JWT_SECRET || 'greenhouse-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthController {

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;


      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Username and password are required' 
        });
      }


      const user = await userModel.authenticate(username, password);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
      

      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          refCode: user.ref_code
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );


      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          refCode: user.ref_code
        },
        token
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Server error during login' 
      });
    }
  }


  async register(req: Request, res: Response) {
    try {
      const { username, password, firstName, lastName, inviteCode } = req.body;


      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Username and password are required' 
        });
      }
      

      if (!inviteCode) {
        return res.status(400).json({
          success: false,
          message: 'Invitation code is required'
        });
      }
      

      const inviter = await userModel.getUserByRefCode(inviteCode);
      if (!inviter) {
        return res.status(400).json({
          success: false,
          message: 'Invalid invitation code'
        });
      }


      const existingUser = await userModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'Username already exists' 
        });
      }


      const newUser = await userModel.createUser(username, password, firstName, lastName, inviteCode);
      
      if (!newUser) {
        return res.status(500).json({ 
          success: false,
          message: 'Failed to create user' 
        });
      }


      const token = jwt.sign(
        { 
          id: newUser.id,
          username: newUser.username,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          refCode: newUser.ref_code
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );

      // Return user info and token
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          refCode: newUser.ref_code
        },
        token
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate')) {
        return res.status(409).json({ 
          success: false,
          message: 'Username already exists' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Server error during registration' 
      });
    }
  }


  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          success: false,
          message: 'No token provided' 
        });
      }


      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token format' 
        });
      }


      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        

        const user = await userModel.getUserById(decoded.id);
        
        if (!user) {
          return res.status(404).json({ 
            success: false,
            message: 'User not found' 
          });
        }
        
        res.status(200).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            refCode: user.ref_code
          }
        });
      } catch (error) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid or expired token' 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Server error during token verification' 
      });
    }
  }
}

export default new AuthController(); 