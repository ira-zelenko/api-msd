import { Request, Response } from 'express';
import { auth0Service } from '../services/auth0.service';
import { RegisterRequest } from '../types/auth.types';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterRequest = req.body;
      const requiredFields: (keyof RegisterRequest)[] = [
        'email', 'password', 'fullName', 'company', 'position', 'telephone'
      ];

      const missing = requiredFields.filter(f => !data[f]);
      if (missing.length) return res.status(400).json({ success: false, error: `Missing fields: ${missing.join(', ')}` });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) return res.status(400).json({ success: false, error: 'Invalid email' });
      if (data.password.length < 8) return res.status(400).json({ success: false, error: 'Password must be at least 8 chars' });

      const user = await auth0Service.createUserWithMetadata(data.email, data.password, {
        company: data.company,
        fullName: data.fullName,
        position: data.position,
        telephone: data.telephone,
      });

      res.status(201).json({
        success: true,
        auth0UserId: user.user_id,
        email: user.email,
        message: 'Check your email to verify your account',
      });
    } catch (err: any) {
      res.status(err.message.includes('already exists') ? 409 : 500).json({ success: false, error: err.message });
    }
  }

  async checkEmailVerified(req: Request, res: Response) {
    try {
      const email = req.query.email as string;
      if (!email) return res.status(400).json({ success: false, error: 'Email required' });

      const user = await auth0Service.getUserByEmail(email);
      res.json({ success: true, email_verified: user.email_verified });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to check email' });
    }
  }

  async healthCheck(_: Request, res: Response) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
}

export const authController = new AuthController();

