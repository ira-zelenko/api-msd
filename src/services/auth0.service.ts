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
   * Create Auth0 user with metadata
   */
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

    try {
      const user = await this.managementClient!.users.create({
        email,
        password,
        connection: auth0Config.connection,
        email_verified: false,
        user_metadata: metadata,
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
    } catch (error: any) {
      if (error.statusCode === 409) {
        throw new Error('User with this email already exists');
      }

      throw new Error('Failed to create user in Auth0');
    }
  }
}

export const auth0Service = new Auth0Service();
