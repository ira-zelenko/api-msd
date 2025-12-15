export interface RegisterRequest {
  company: string;
  fullName: string;
  position: string;
  email: string;
  telephone: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  auth0UserId: string;
  email: string;
  message: string;
}

export interface Auth0CreateUserResponse {
  user_id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}
