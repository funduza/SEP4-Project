import pool from '../config/db';
import crypto from 'crypto';

export interface User {
  id: number;
  username: string;
  password?: string;
  first_name: string | null;
  last_name: string | null;
  ref_code: string;
  invited_by: number | null;
  created_at: string;
  updated_at: string;
}

class UserModel {

  async authenticate(username: string, password: string): Promise<User | null> {
    try {

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      

      const [rows] = await pool.query(
        `SELECT id, username, password, first_name, last_name, ref_code, invited_by, created_at, updated_at 
         FROM users 
         WHERE username = ? AND password = ?`,
        [username, hashedPassword]
      );
      
      const users = rows as User[];
      
      if (users.length === 0) {
        return null;
      }
      

      const user = users[0];
      delete user.password;
      
      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }


  async getUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.query(
        `SELECT id, username, first_name, last_name, ref_code, invited_by, created_at, updated_at 
         FROM users 
         WHERE id = ?`,
        [id]
      );
      
      const users = rows as User[];
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }


  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const [rows] = await pool.query(
        `SELECT id, username, first_name, last_name, ref_code, invited_by, created_at, updated_at 
         FROM users 
         WHERE username = ?`,
        [username]
      );
      
      const users = rows as User[];
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      console.error('Get user by username error:', error);
      throw error;
    }
  }


  async getUserByRefCode(refCode: string): Promise<User | null> {
    try {
      const [rows] = await pool.query(
        `SELECT id, username, first_name, last_name, ref_code, invited_by, created_at, updated_at 
         FROM users 
         WHERE ref_code = ?`,
        [refCode]
      );
      
      const users = rows as User[];
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      console.error('Get user by reference code error:', error);
      throw error;
    }
  }


  async createUser(
    username: string, 
    password: string, 
    firstName: string | null = null, 
    lastName: string | null = null,
    inviteCode: string
  ): Promise<User | null> {
    try {

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      

      const refCode = await this.generateUniqueRefCode();
      

      let inviterId = null;
      const inviter = await this.getUserByRefCode(inviteCode);
      if (inviter) {
        inviterId = inviter.id;
      } else {
        throw new Error('Invalid invitation code');
      }
      

      const [result] = await pool.query(
        `INSERT INTO users (username, password, first_name, last_name, ref_code, invited_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, hashedPassword, firstName, lastName, refCode, inviterId]
      );
      

      const insertId = (result as any).insertId;
      

      return this.getUserById(insertId);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Generate a unique reference code
  private async generateUniqueRefCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let isUnique = false;
    let refCode = '';
    
    while (!isUnique) {

      refCode = '';
      for (let i = 0; i < codeLength; i++) {
        refCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      

      const [rows] = await pool.query(
        'SELECT 1 FROM users WHERE ref_code = ?',
        [refCode]
      );
      
      isUnique = (rows as any[]).length === 0;
    }
    
    return refCode;
  }
}

export default new UserModel(); 