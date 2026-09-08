export type Role = 'SUPER_ADMIN' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: Role;
}

export interface AdminAccountDto {
  id: string;
  email: string;
  enabled: boolean;
  createdAt: string;
}

export interface ErrorResponse {
  message: string;
  fieldErrors: string[];
}
