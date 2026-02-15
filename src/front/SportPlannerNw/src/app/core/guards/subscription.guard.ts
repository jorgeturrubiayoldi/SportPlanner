import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

export const subscriptionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Si ya tenemos el estado de suscripción en el signal, lo usamos
  const hasSubscription = subscriptionService.hasActiveSubscription() || 
                         await subscriptionService.checkSubscriptionStatus(user.id);
  
  if (hasSubscription) {
    return true;
  }

  return router.createUrlTree(['/onboarding/subscription']);
};
