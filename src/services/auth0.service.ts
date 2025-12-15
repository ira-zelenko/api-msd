// backend/src/services/auth0.service.ts
import { ManagementClient, AuthenticationClient } from 'auth0';
import { auth0Config } from '../config/auth0.config';
import {
  Auth0CreateUserResponse,
  Auth0TokenResponse
} from '../types/auth.types';

class Auth0Service {
  private managementClient: ManagementClient;
  private authenticationClient: AuthenticationClient;

  constructor() {
    // M2M Application for Management API (creating users)
    this.managementClient = new ManagementClient({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      clientSecret: auth0Config.clientSecret,
    });

    // SPA Application for Authentication (getting tokens)
    this.authenticationClient = new AuthenticationClient({
      domain: auth0Config.domain,
      clientId: auth0Config.spaClientId,
      clientSecret: auth0Config.spaClientSecret,
    });
  }

  /**
   * Create a new user in Auth0 (email and password only)
   */
  async createUser(email: string, password: string): Promise<Auth0CreateUserResponse> {
    try {
      const response = await this.managementClient.users.create({
        email: email,
        password: password,
        connection: auth0Config.connection,
        email_verified: false,
      });

      const userData = response.data || response;

      if (!userData || !userData.user_id) {
        console.error('Invalid response from Auth0:', userData);
        throw new Error('Invalid response from Auth0 - user_id not found');
      }

      console.log('✅ User created successfully:', userData.user_id);

      return {
        user_id: userData.user_id,
        email: userData.email,
        email_verified: userData.email_verified || false,
        created_at: userData.created_at || new Date().toISOString(),
      };

    } catch (error: any) {
      console.error('Auth0 create user error:', error);

      if (error.statusCode === 409) {
        throw new Error('User with this email already exists');
      }

      if (error.message?.includes('PasswordStrengthError')) {
        throw new Error('Password does not meet security requirements');
      }

      if (error.message?.includes('Invalid response from Auth0')) {
        throw error;
      }

      throw new Error('Failed to create user in Auth0');
    }
  }

  /**
   * Authenticate user and get tokens
   */
  async getTokens(email: string, password: string): Promise<Auth0TokenResponse> {
    try {
      console.log('Requesting tokens with realm:', auth0Config.connection);

      const response = await this.authenticationClient.oauth.passwordGrant({
        username: email,
        password: password,
        realm: auth0Config.connection, // CRITICAL: Must specify the connection
        audience: auth0Config.audience,
        scope: 'openid profile email',
      });

      const tokenData = response.data || response;

      if (!tokenData || !tokenData.access_token) {
        console.error('Invalid token response from Auth0:', tokenData);
        throw new Error('Invalid token response from Auth0');
      }

      console.log('✅ Tokens generated successfully');

      return {
        access_token: tokenData.access_token,
        id_token: tokenData.id_token || '',
        expires_in: tokenData.expires_in || 86400,
        token_type: tokenData.token_type || 'Bearer',
      };

    } catch (error: any) {
      console.error('Auth0 get tokens error:', error);
      console.error('Error details:', {
        domain: auth0Config.domain,
        clientId: auth0Config.spaClientId,
        connection: auth0Config.connection,
        audience: auth0Config.audience
      });
      throw new Error('Failed to authenticate user');
    }
  }
}

export const auth0Service = new Auth0Service();
