export interface Permission {
  id: number;
  name: string;
  path: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_admin: boolean;
  permissions: Permission[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_verified?: boolean;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  uid: string;
  token: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  csrf_token?: string;
}
