import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: 'onboarding/subscription',
    loadComponent: () => import('./onboarding/subscription/subscription').then((m) => m.SubscriptionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard, subscriptionGuard]
  },
];
