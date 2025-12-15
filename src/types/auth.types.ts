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
  accessToken: string;
  idToken: string;
  expiresIn: number;
  userData: {
    company: string;
    fullName: string;
    position: string;
    email: string;
    telephone: string;
  };
}

export interface Auth0CreateUserResponse {
  user_id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export interface Auth0TokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}
