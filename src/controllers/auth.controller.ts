import { Request, Response } from 'express';
import { auth0Service } from '../services/auth0.service';
import { RegisterRequest } from '../types/auth.types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;

      const requiredFields: (keyof RegisterRequest)[] = [
        'email',
        'password',
        'fullName',
        'company',
        'position',
        'telephone',
      ];

      const missing = requiredFields.filter(field => !data[field]);
      if (missing.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing fields: ${missing.join(', ')}`,
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        res.status(400).json({ success: false, error: 'Invalid email' });
        return;
      }

      if (data.password.length < 8) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
        return;
      }

      const user = await auth0Service.createUserWithMetadata(
        data.email,
        data.password,
        {
          company: data.company,
          fullName: data.fullName,
          position: data.position,
          telephone: data.telephone,
        }
      );

      res.status(201).json({
        success: true,
        auth0UserId: user.user_id,
        email: user.email,
        message: 'Check your email to verify your account',
      });

    } catch (error: any) {
      res.status(
        error.message.includes('already exists') ? 409 : 500
      ).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }

  async healthCheck(_: Request, res: Response): Promise<void> {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
}

export const authController = new AuthController();
