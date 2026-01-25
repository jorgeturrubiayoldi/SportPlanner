import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

/**
 * Este guard ASEGURA que el usuario NO tenga una suscripción activa.
 * Se usa para proteger las páginas de venta/onboarding.
 * Si el usuario ya pagó, no debería ver la pantalla de precios, sino su dashboard.
 */
export const noSubscriptionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  // 1. Obtener usuario (asumimos que authGuard ya corrió antes, pero verificamos por seguridad)
  const user = await authService.getCurrentUser();
  
  if (!user) {
    // Si no está logueado, dejamos pasar. 
    // (Opcionalmente podríamos redirigir a login, pero authGuard se encarga de eso en la ruta)
    return true; 
  }

  // 2. Verificar si YA tiene suscripción
  console.log('NoSubscriptionGuard: Checking duplication for:', user.id);
  const hasActiveSubscription = await subscriptionService.checkSubscriptionStatus(user.id);

  if (hasActiveSubscription) {
    console.warn('NoSubscriptionGuard: User already has subscription. Redirecting to dashboard.');
    // REDIRECCIÓN: Ya eres cliente, ve a tu panel.
    return router.createUrlTree(['/dashboard']);
  }

  // 3. No tiene suscripción, permitir acceso a la página de compra
  return true;
};
