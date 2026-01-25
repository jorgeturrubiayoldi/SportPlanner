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
  console.log('SubscriptionGuard: Checking for user:', user?.id);

  if (!user) {
    console.log('SubscriptionGuard: No user found, redirecting to login');
    return router.createUrlTree(['/auth/login']);
  }

  // 2. Verificar suscripción
  console.log('SubscriptionGuard: Checking subscription status for:', user.id);
  const hasSubscription = await subscriptionService.checkSubscriptionStatus(user.id);
  console.log('SubscriptionGuard: Has active subscription?', hasSubscription);
  
  if (hasSubscription) {
    console.log('SubscriptionGuard: Access granted to dashboard');
    return true;
  }

  // 3. Si no tiene suscripción, redirigir al onboarding
  console.warn('SubscriptionGuard: No active subscription found, redirecting to onboarding');
  return router.createUrlTree(['/onboarding/subscription']);
};
