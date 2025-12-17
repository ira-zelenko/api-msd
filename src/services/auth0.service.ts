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

    console.log('✅ Auth0 Management client initialized');
  }

  async createUserWithMetadata(
    email: string,
    password: string,
    metadata: {
      company: string;
      fullName: string;
      position: string;
      telephone: string;
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
        isFirstLogin: true, // Flag for first login
        hasCompletedSetup: false, // Flag for completed setup
      },
    });

    return {
      user_id: user.user_id!,
      email: user.email!,
      email_verified: user.email_verified ?? false,
      created_at:
        typeof user.created_at === 'string'
          ? user.created_at
          : new Date().toISOString(),
    };
  }

  /**
   * Mark user as having completed first login
   */
  async markFirstLoginComplete(userId: string): Promise<void> {
    this.initializeClient();

    try {
      await this.managementClient!.users.update(userId, {
        user_metadata: {
          isFirstLogin: false,
        },
      });

      console.log('✅ First login marked as complete for:', userId);
    } catch (error: any) {
      console.error('❌ Failed to update first login flag:', error);
      throw new Error('Failed to update user metadata');
    }
  }

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

    if (!response.ok) throw new Error('Failed to fetch user by email');

    const users = await response.json();
    if (!users || users.length === 0) throw new Error('User not found');

    return users[0];
  }

  async updateUserMetadata(
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    this.initializeClient();

    try {
      // Get current metadata first
      const user = await this.managementClient!.users.get(userId);
      const currentMetadata = (user as any).user_metadata || {};

      // Merge with new metadata
      const updatedMetadata = {
        ...currentMetadata,
        ...metadata,
      };

      // Update in Auth0
      await this.managementClient!.users.update(userId, {
        user_metadata: updatedMetadata,
      });

      console.log('✅ User metadata updated for:', userId);
    } catch (error: any) {
      console.error('❌ Failed to update user metadata:', error);
      throw new Error('Failed to update user metadata');
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
