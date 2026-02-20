import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { ActiveSubscription, Invoice, Sport, SubscribeRequest, SubscriptionMember } from '../models/subscription.model';

export type { ActiveSubscription, Invoice, Sport, SubscribeRequest, SubscriptionMember };

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private supabase = inject(SupabaseService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/Subscription`;

  hasActiveSubscription = signal<boolean>(false);
  loading = signal<boolean>(true);

  async checkSubscriptionStatus(userId: string): Promise<boolean> {
    this.loading.set(true);
    try {
      // Llamada directa al backend para evitar problemas de sesión con Supabase-JS en el frontend
      const isActive = await firstValueFrom(
        this.http.get<boolean>(`${this.apiUrl}/status/${userId}`)
      );
      
      this.hasActiveSubscription.set(isActive);
      return isActive;
    } catch (err) {
      console.error('Error checking subscription:', err);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async getSports(): Promise<Sport[]> {
    try {
      return await firstValueFrom(this.http.get<Sport[]>(`${this.apiUrl}/sports`));
    } catch (err) {
      console.error('Error fetching sports from backend:', err);
      return [];
    }
  }

  async subscribeToPlan(userId: string, planType: string, price: number, sportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const request: SubscribeRequest = {
        userId,
        planType,
        amount: price,
        sportId
      };
      
      await firstValueFrom(this.http.post<any>(`${this.apiUrl}/subscribe`, request));

      this.hasActiveSubscription.set(true);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.error?.message || err.message || '';

      // DETECCIÓN DE USUARIO FANTASMA:
      // Si el backend dice que el usuario no existe, nuestra sesión local es basura.
      if (errorMessage.includes('no existe en el sistema de autenticación')) {
        console.warn('Detectada sesión inválida (Usuario Fantasma). Cerrando sesión...');
        
        // 1. Limpiar sesión local usando el cliente de Supabase
        await this.supabase.getClient().auth.signOut();
        
        // 2. Redirigir al registro para crear el usuario real
        this.router.navigate(['/auth/register'], { 
          queryParams: { error: 'session_expired' } 
        });
        
        return { success: false, error: 'Tu sesión ha expirado o el usuario no es válido. Por favor regístrate nuevamente.' };
      }

      return { success: false, error: errorMessage || 'Error al procesar la suscripción' };
    }
  }

  async getActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ActiveSubscription>(`${this.apiUrl}/active/${userId}`)
      );
      return response;
    } catch (err) {
      console.error('Error fetching active subscription:', err);
      return null;
    }
  }

  async getInvoices(subscriptionId: string): Promise<Invoice[]> {
    try {
      return await firstValueFrom(this.http.get<Invoice[]>(`${this.apiUrl}/${subscriptionId}/invoices`));
    } catch (err) {
      console.error('Error fetching invoices:', err);
      return [];
    }
  }

  async getMembers(subscriptionId: string): Promise<SubscriptionMember[]> {
    try {
      return await firstValueFrom(this.http.get<SubscriptionMember[]>(`${this.apiUrl}/${subscriptionId}/members`));
    } catch (err) {
      console.error('Error fetching members:', err);
      return [];
    }
  }

  async addMember(subscriptionId: string, userId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/${subscriptionId}/members`, { userId }));
      return true;
    } catch (err) {
      console.error('Error adding member:', err);
      return false;
    }
  }

  async removeMember(subscriptionId: string, userId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${subscriptionId}/members/${userId}`));
      return true;
    } catch (err) {
      console.error('Error removing member:', err);
      return false;
    }
  }
}
