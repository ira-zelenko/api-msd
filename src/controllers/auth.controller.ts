import { Request, Response } from 'express';
import { auth0Service } from '../services/auth0.service';
import { RegisterRequest } from '../types/auth.types';
import {
  sanitizeString,
  validateEmail,
  validatePassword,
  validateName,
  validateCompany,
  validatePhone,
} from '../utils/validation';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterRequest = req.body;

      // 1. Check all required fields
      const requiredFields: (keyof RegisterRequest)[] = [
        'email',
        'password',
        'fullName',
        'company',
        'position',
        'telephone',
      ];

      const missing = requiredFields.filter((f) => !data[f]);
      if (missing.length) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`,
        });
      }

      // 2. Sanitize all inputs
      const sanitizedData = {
        email: sanitizeString(data.email).toLowerCase(),
        password: data.password,
        fullName: sanitizeString(data.fullName),
        company: sanitizeString(data.company),
        position: sanitizeString(data.position),
        telephone: sanitizeString(data.telephone),
      };

      if (!validateEmail(sanitizedData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }

      const passwordValidation = validatePassword(sanitizedData.password);

      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          error: passwordValidation.error,
        });
      }

      if (!validateName(sanitizedData.fullName)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid name format',
        });
      }

      if (!validateCompany(sanitizedData.company)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid company name',
        });
      }

      if (!validateName(sanitizedData.position)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid position format',
        });
      }

      if (!validatePhone(sanitizedData.telephone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format',
        });
      }

      const user = await auth0Service.createUserWithMetadata(
        sanitizedData.email,
        sanitizedData.password,
        {
          company: sanitizedData.company,
          fullName: sanitizedData.fullName,
          position: sanitizedData.position,
          telephone: sanitizedData.telephone,
        }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.',
      });
    }
  }

  async updateUserMetadata(req: Request, res: Response) {
    try {
      const { userId, metadata } = req.body;

      if (!userId || !metadata) {
        return res.status(400).json({
          success: false,
          error: 'User ID and metadata required',
        });
      }

      console.log('📝 Updating user metadata for:', userId);
      console.log('New metadata:', metadata);

      await auth0Service.updateUserMetadata(userId, metadata);

      console.log('✅ User metadata updated in Auth0');

      res.json({
        success: true,
        message: 'User metadata updated',
      });
    } catch (err: any) {
      console.error('❌ Update metadata error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to update user metadata',
      });
    }
  }

  async healthCheck(_: Request, res: Response) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}

export const authController = new AuthController();
