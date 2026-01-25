import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionComponent implements OnInit {
  private authService = inject(AuthService);
  private subService = inject(SubscriptionService);
  private router = inject(Router);

  loading = signal<string | null>(null);
  sports = signal<any[]>([]);
  selectedSportId = signal<string>('');

  plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 9.99,
      currency: '€',
      features: ['Gestión de 1 equipo', 'Planificación básica', 'Estadísticas simples', 'Soporte por email']
    },
    {
      id: 'pro',
      name: 'Profesional',
      price: 24.99,
      currency: '€',
      features: ['Gestión de 5 equipos', 'IA Assistant', 'Estadísticas avanzadas', 'Exportación PDF', 'Soporte prioritario'],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Club',
      price: 99.99,
      currency: '€',
      features: ['Equipos ilimitados', 'API Access', 'Marca blanca', 'Gestor de cuenta dedicado', 'Formación inicial']
    }
  ];

  async ngOnInit() {
    const sportsList = await this.subService.getSports();
    this.sports.set(sportsList);
  }

  async selectPlan(plan: PricingPlan) {
    if (!this.selectedSportId()) {
      alert('Por favor selecciona un deporte primero');
      return;
    }

    // Usar la señal currentUser en lugar de getCurrentUser() que hace llamada a Supabase
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading.set(plan.id);
    
    console.log(`Selecting plan ${plan.id} for user ${user.id}`);

    const result = await this.subService.subscribeToPlan(
      user.id, 
      plan.id, 
      plan.price,
      this.selectedSportId()
    );

    console.log('Subscription result:', result);

    if (result.success) {
      console.log('Redirecting to dashboard...');
      this.loading.set(null); // Reset loading before navigating
      this.router.navigate(['/dashboard']);
    } else {
      console.error('Subscription error:', result.error);
      alert('Error al procesar la suscripción: ' + result.error);
      this.loading.set(null);
    }
  }
}
