import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

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
      const { data, error } = await this.supabase.getClient()
        .from('subscriptions')
        .select('status, end_date')
        .eq('owner_id', userId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      const isActive = !!data;
      this.hasActiveSubscription.set(isActive);
      return isActive;
    } catch (err) {
      console.error('Error checking subscription:', err);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async getSports(): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/sports`));
    } catch (err) {
      console.error('Error fetching sports from backend:', err);
      return [];
    }
  }

  async subscribeToPlan(userId: string, planType: string, price: number, sportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await firstValueFrom(this.http.post<any>(`${this.apiUrl}/subscribe`, {
        userId,
        planType,
        amount: price,
        sportId
      }));

      this.hasActiveSubscription.set(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.error?.message || 'Error al procesar la suscripción' };
    }
  }
}
