import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';

export class UserController {
  // Register a new user
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        throw new BadRequestError('Email, password, and name are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email format');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new BadRequestError('Password must be at least 6 characters long');
      }

      const userRepository = getRepository(User);

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new BadRequestError('User with this email already exists');
      }

      // Create new user
      const user = userRepository.create({
        email,
        password,
        name,
        phone
      });

      // Hash password
      await user.hashPassword();

      // Save user
      await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      const responseData = {
        user: userWithoutPassword,
        token
      };

      const response = ResponseHandler.success(responseData, 'User registered successfully', 201);
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      // Error will be handled by the errorHandler middleware
      throw error;
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Get user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ message: 'Error fetching profile', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, phone } = req.body;

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      await userRepository.save(user);

      // Return updated user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await user.verifyPassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.hashPassword();
      await userRepository.save(user);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Error changing password', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Get all users
  static async getAll(req: Request, res: Response) {
    try {
      const userRepository = getRepository(User);
      const users = await userRepository.find();

      // Return users without passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Error fetching users', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
