import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  loading = signal(false);

  constructor() {
    this.checkSession();
  }

  private async checkSession() {
    try {
      const { data: { session } } = await this.supabaseService.getClient().auth.getSession();
      if (session?.user) {
        this.currentUser.set({
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.['fullName']
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabaseService.getClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser.set({
          id: data.user.id,
          email: data.user.email!,
          fullName: data.user.user_metadata?.['fullName']
        });
        return { success: true };
      }

      return { success: false, error: 'No se pudo crear el usuario' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error desconocido' };
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser.set({
          id: data.user.id,
          email: data.user.email!,
          fullName: data.user.user_metadata?.['fullName']
        });
        return { success: true };
      }

      return { success: false, error: 'No se pudo iniciar sesión' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error desconocido' };
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
