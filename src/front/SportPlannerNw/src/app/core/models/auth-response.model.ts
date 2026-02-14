import { User } from './user.model';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: AuthError;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user?: any; // Supabase user object structure is complex, acceptable to keep any here or strictly define it later
}

export interface AuthError {
  message: string;
  status?: number;
}
