export interface AuthResponse {
  user: any;
  session: any;
}

export interface AuthError {
  message: string;
  status?: number;
}
