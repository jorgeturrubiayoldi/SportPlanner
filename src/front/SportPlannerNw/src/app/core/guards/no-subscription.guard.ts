import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

export const noSubscriptionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  const user = authService.currentUser();
  
  if (!user) {
    return true; 
  }

  const hasActiveSubscription = subscriptionService.hasActiveSubscription() || 
                               await subscriptionService.checkSubscriptionStatus(user.id);

  if (hasActiveSubscription) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
