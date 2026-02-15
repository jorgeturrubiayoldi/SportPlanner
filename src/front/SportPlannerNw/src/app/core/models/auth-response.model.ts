export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  token: string;
  refreshToken?: string;
  language?: string;
  avatarUrl?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  language: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
