interface RegisterRequest {
  company: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  password: string;
}

interface Auth0CreateUserResponse {
  user_id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export { RegisterRequest, Auth0CreateUserResponse }
