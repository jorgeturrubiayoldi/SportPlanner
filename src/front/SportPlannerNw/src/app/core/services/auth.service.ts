import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  private http = inject(HttpClient);
  private translateService = inject(TranslateService);
  private apiUrl = `${environment.apiUrl}/Auth`;

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  loading = signal(false);

  constructor() {
    // Session check is now handled via init() called from APP_INITIALIZER
  }

  public async init(): Promise<void> {
    try {
      const { data: { session } } = await this.supabaseService.getClient().auth.getSession();
      if (session?.user) {
        await this.loadProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  private async loadProfile(authUser: any) {
    try {
      const { data: profile, error } = await this.supabaseService.getClient()
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profile) {
        this.currentUser.set({
          id: authUser.id,
          email: authUser.email!,
          fullName: profile.full_name || authUser.user_metadata?.['fullName'],
          avatarUrl: profile.avatar_url,
          phone: profile.phone,
          language: profile.language
        });
        
        if (profile.language) {
          this.translateService.use(profile.language);
        }
      } else {
        this.currentUser.set({
          id: authUser.id,
          email: authUser.email!,
          fullName: authUser.user_metadata?.['fullName']
        });
        
        // If no profile, but authUser has language metadata, use it
        if (authUser.user_metadata?.['language']) {
          this.translateService.use(authUser.user_metadata['language']);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  async signUp(email: string, password: string, fullName: string, language: string): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/register`, { email, password, fullName, language })
      );

      if (response && response.token) {
        await this.supabaseService.getClient().auth.setSession({
          access_token: response.token,
          refresh_token: response.refreshToken || ''
        });

        this.currentUser.set({
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          language: response.language,
          avatarUrl: response.avatarUrl
        });

        if (response.language) {
          this.translateService.use(response.language);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.error?.message || 'Error al crear la cuenta' };
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      );

      if (response && response.id) {
        // Actualizamos la sesión de Supabase primero
        if (response.token) {
          await this.supabaseService.getClient().auth.setSession({
            access_token: response.token,
            refresh_token: response.refreshToken || ''
          });
        }

        // Seteamos el usuario directamente con los datos del backend (Ahorramos 1 llamada)
        this.currentUser.set({
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          language: response.language,
          avatarUrl: response.avatarUrl
        });

        if (response.language) {
          this.translateService.use(response.language);
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.error?.message || 'Credenciales inválidas' };
    } finally {
      this.loading.set(false);
    }
  }


  async signOut(): Promise<void> {
    try {
      await this.supabaseService.getClient().auth.signOut();
      this.currentUser.set(null);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabaseService.getClient().auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.['fullName']
      };
    }
    return null;
  }
}
