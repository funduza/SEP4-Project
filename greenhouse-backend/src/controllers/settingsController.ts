import { Request, Response } from 'express';
import pool from '../config/db';

interface UserProfile {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  refCode: string;
}

const settingsController = {
  async getUserProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const userId = req.user.id;
      
      const [rows] = await pool.query(
        'SELECT id, username, first_name as firstName, last_name as lastName, ref_code as refCode FROM users WHERE id = ?',
        [userId]
      );
      
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const userProfile: UserProfile = rows[0] as UserProfile;
      
      return res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching user profile'
      });
    }
  },
  
  async updateUserProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const userId = req.user.id;
      const { firstName, lastName } = req.body;
      
      if (firstName && typeof firstName !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'First name must be a string'
        });
      }
      
      if (lastName && typeof lastName !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Last name must be a string'
        });
      }
      
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
        [firstName, lastName, userId]
      );
      
      const [rows] = await pool.query(
        'SELECT id, username, first_name as firstName, last_name as lastName, ref_code as refCode FROM users WHERE id = ?',
        [userId]
      );
      
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found after update'
        });
      }
      
      const updatedUserProfile: UserProfile = rows[0] as UserProfile;
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUserProfile
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating user profile'
      });
    }
  }
};

export default settingsController; 