import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

export const subscriptionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  // 1. Asegurarse de que el usuario está autenticado primero
  const user = await authService.getCurrentUser();
  if (!user) {
    return router.createUrlTree(['/auth/login']);
  }

  // 2. Verificar suscripción
  const hasSubscription = await subscriptionService.checkSubscriptionStatus(user.id);
  
  if (hasSubscription) {
    return true;
  }

  // 3. Si no tiene suscripción, redirigir al onboarding
  return router.createUrlTree(['/onboarding/subscription']);
};
