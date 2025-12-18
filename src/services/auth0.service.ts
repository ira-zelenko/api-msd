import { ManagementClient } from 'auth0';
import { auth0Config } from '../config/auth0.config';
import { Auth0CreateUserResponse } from '../types/auth.types';

class Auth0Service {
  private managementClient: ManagementClient | null = null;

  private initializeClient() {
    if (this.managementClient) return;

    this.managementClient = new ManagementClient({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      clientSecret: auth0Config.clientSecret,
    });
  }

  /**
   * Create user with metadata from create acc form
   */
  async createUserWithMetadata(
    email: string,
    password: string,
    metadata: {
      company: string;
      fullName: string;
      position: string;
      phone: string;
    }
  ): Promise<Auth0CreateUserResponse> {
    this.initializeClient();

    const user = await this.managementClient!.users.create({
      email,
      password,
      connection: auth0Config.connection,
      email_verified: false,
      user_metadata: {
        ...metadata,
        isFirstLogin: true,
      },
    });

    return {
      user_id: user.user_id!,
      email: user.email!,
      email_verified: user.email_verified ?? false,
      created_at:
        typeof user.created_at === 'string' ? user.created_at : new Date().toISOString(),
    };
  }

  /**
   * Check if phone number already exists
   */
  async isPhoneNumberTaken(phone: string): Promise<boolean> {
    this.initializeClient();

    try {
      const token = await this.getManagementToken();

      // Use Management API directly to search users by phone
      const response = await fetch(
        `https://${auth0Config.domain}/api/v2/users?q=user_metadata.telephone:"${encodeURIComponent(phone)}"&search_engine=v3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const users = await response.json();

      return users.length > 0;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string) {
    this.initializeClient();

    try {
      const token = await this.getManagementToken();

      const response = await fetch(
        `https://${auth0Config.domain}/api/v2/users?q=user_metadata.telephone:"${encodeURIComponent(phone)}"&search_engine=v3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users by phone');
      }

      const users = await response.json();

      if (!users.length) {
        throw new Error('User not found');
      }

      return users[0];
    } catch (error: any) {
      throw new Error('User not found');
    }
  }

  /**
   * Get user by email from Auth0
   */
  async getUserByEmail(email: string) {
    this.initializeClient();

    const token = await this.getManagementToken();

    const response = await fetch(
      `https://${auth0Config.domain}/api/v2/users-by-email?email=${encodeURIComponent(
        email
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user by email');
    }

    const users = await response.json();
    if (!users || !users.length) {
      throw new Error('User not found');
    }

    return users[0];
  }

  /**
   * Update user metadata in Auth0
   */
  async updateUserMetadata(
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    this.initializeClient();

    try {
      const user = await this.managementClient!.users.get(userId);
      const currentMetadata = (user as any).user_metadata || {};

      const updatedMetadata = {
        ...currentMetadata,
        ...metadata,
      };

      await this.managementClient!.users.update(userId, {
        user_metadata: updatedMetadata,
      });

    } catch (error: any) {
      throw new Error('Failed to update user metadata');
    }
  }

  /**
   * Resend verification email for a user
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    this.initializeClient();

    try {
      const token = await this.getManagementToken();

      const response = await fetch(
        `https://${auth0Config.domain}/api/v2/jobs/verification-email`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to send verification email');
      }
    } catch (error: any) {
      throw new Error('Failed to resend verification email');
    }
  }

  private async getManagementToken(): Promise<string> {
    const response = await fetch(`https://${auth0Config.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: auth0Config.clientId,
        client_secret: auth0Config.clientSecret,
        audience: `https://${auth0Config.domain}/api/v2/`,
      }),
    });

    if (!response.ok) throw new Error('Failed to get management token');
    const data = await response.json();
    return data.access_token;
  }
}

export const auth0Service = new Auth0Service();
