import { Request, Response } from 'express';
import { auth0Service } from '../services/auth0.service';
import { callYSDAPI } from '../services/m2m.service';
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
        'phone',
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
        phone: sanitizeString(data.phone),
      };

      const { email, password, fullName, company, position, phone} = sanitizedData;

      // 3. Validate inputs
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }

      const passwordValidation = validatePassword(password);

      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          error: passwordValidation.error,
        });
      }

      if (!validateName(fullName)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid name format',
        });
      }

      if (!validateCompany(company)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid company name',
        });
      }

      if (!validateName(position)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid position format',
        });
      }

      if (!validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format',
        });
      }

      // 4. Check if phone already exists
      const phoneExists = await auth0Service.isPhoneNumberTaken(phone);

      if (phoneExists) {
        return res.status(409).json({
          success: false,
          error: 'This phone number is already registered',
        });
      }

      // 5. CREATE USER IN AUTH0 FIRST
      const auth0User = await auth0Service.createUserWithMetadata(
        email,
        password,
        {
          company,
          fullName,
          position,
          phone,
        }
      );

      // 6. CREATE CLIENT IN PYTHON API using M2M token
      const clientPayload = {
        name: company,
        contact: {
          fullName,
          email,
          position,
          phone,
        },
        carrierAccounts: [],
      };

      try {
        const pythonResponse = await callYSDAPI('/clients/', {
          method: 'POST',
          body: JSON.stringify(clientPayload),
        });

        if (!pythonResponse.ok) {
          const errorData = await pythonResponse.text();

          console.log('Failed to create client in Python API:', errorData);

          try {
            await auth0Service.deleteUser(auth0User.user_id);
          } catch (deleteError) {
            console.log(deleteError);
          }

          return res.status(500).json({
            success: false,
            error: 'Failed to create client account',
          });
        }


        const pythonClientData = await pythonResponse.json();

        // 7. UPDATE AUTH0 USER METADATA with client ID
        const client_id = pythonClientData?.client_id;

        if (!client_id) {
          await auth0Service.deleteUser(auth0User.user_id);

          return res.status(500).json({
            success: false,
            error: 'Client creation failed: missing client_id',
          });
        }

        await auth0Service.updateUserMetadata(auth0User.user_id, { client_id });

        // 8. Return success
        res.status(201).json({
          success: true,
          message: 'Registration successful! Please check your email to verify your account.',
          userId: auth0User.user_id,
          client_id,
        });

      } catch (pythonError: any) {
        console.error('Python API error:', pythonError);

        // Rollback: Delete the Auth0 user
        try {
          await auth0Service.deleteUser(auth0User.user_id);
        } catch (deleteError) {
          console.error('❌ Failed to rollback Auth0 user:', deleteError);
        }

        return res.status(500).json({
          success: false,
          error: 'Failed to create client account. Please try again.',
          message: pythonError.message,
        });
      }

    } catch (err: any) {
      console.error('❌ Registration error:', err);

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

      if (metadata.phone) {
        try {
          const existingUser = await auth0Service.getUserByPhone(metadata.phone);

          if (existingUser.user_id !== userId) {
            return res.status(409).json({
              success: false,
              error: 'This phone number is already registered',
            });
          }
        } catch (err) {
          console.log('Phone number is available');
        }
      }

      await auth0Service.updateUserMetadata(userId, metadata);

      res.json({
        success: true,
        message: 'User metadata updated',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to update user metadata',
      });
    }
  }

  async resendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }

      const user = await auth0Service.getUserByEmail(email);

      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          error: 'Email is already verified. Please try logging in.',
        });
      }

      await auth0Service.resendVerificationEmail(user.user_id);

      res.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      });
    } catch (err: any) {
      if (err.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email address.',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to resend verification email. Please try again later.',
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
