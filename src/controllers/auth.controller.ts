// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { auth0Service } from '../services/auth0.service';
import { RegisterRequest, RegisterResponse } from '../types/auth.types';

export class AuthController {
  /**
   * Handle user registration
   * 1. Create user in Auth0
   * 2. Get authentication tokens
   * 3. Return tokens + user data for external API
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const registrationData: RegisterRequest = req.body;

      console.log('📝 Registration request received for:', registrationData.email);

      // Validate required fields
      const requiredFields: (keyof RegisterRequest)[] = [
        'email',
        'password',
        'fullName',
        'company',
        'position',
        'telephone',
      ];

      const missingFields = requiredFields.filter(field => !registrationData[field]);

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
        return;
      }

      // Validate password strength
      if (registrationData.password.length < 8) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
        return;
      }

      // 1. Create user in Auth0 (email + password only)
      console.log('🔐 Creating user in Auth0...');
      const auth0User = await auth0Service.createUser(
        registrationData.email,
        registrationData.password
      );

      if (!auth0User || !auth0User.user_id) {
        throw new Error('Failed to create user - no user_id returned');
      }

      console.log('✅ User created in Auth0:', auth0User.user_id);

      // 2. Get authentication tokens
      console.log('🎫 Getting authentication tokens...');
      const tokens = await auth0Service.getTokens(
        registrationData.email,
        registrationData.password
      );

      if (!tokens || !tokens.access_token) {
        throw new Error('Failed to get tokens');
      }

      console.log('✅ Tokens generated for user:', auth0User.user_id);

      // 3. Return response with tokens and user data
      const response: RegisterResponse = {
        success: true,
        auth0UserId: auth0User.user_id,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expires_in,
        userData: {
          company: registrationData.company,
          fullName: registrationData.fullName,
          position: registrationData.position,
          email: registrationData.email,
          telephone: registrationData.telephone,
        },
      };

      console.log('✅ Registration completed successfully');
      res.status(201).json(response);

    } catch (error: any) {
      console.error('❌ Registration error:', error);

      // Handle specific errors
      const statusCode = error.message.includes('already exists') ? 409 : 500;

      res.status(statusCode).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      console.log('📝 Login request received for:', email);

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
        return;
      }

      // Get authentication tokens from Auth0
      const tokens = await auth0Service.getTokens(email, password);

      console.log('✅ Login successful for:', email);

      res.status(200).json({
        success: true,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expires_in,
      });

    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    });
  }
}

export const authController = new AuthController();
