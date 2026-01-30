import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';
import { noSubscriptionGuard } from './core/guards/no-subscription.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
    pathMatch: 'full'
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
    canActivate: [authGuard, noSubscriptionGuard]
  },
  // Authenticated Layout Wrapper
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard, subscriptionGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'equipos',
        loadComponent: () => import('./teams/teams.component').then((m) => m.TeamsComponent),
      },
      {
        path: 'teams/:id/manage',
        loadComponent: () => import('./teams/team-management/team-management.component').then(m => m.TeamManagementComponent),
      },
      // Placeholders for sidebar links to prevent 404s
      {
        path: 'planificaciones',
        redirectTo: 'dashboard'
      },
      {
        path: 'ejercicios',
        redirectTo: 'dashboard'
      },
      {
        path: 'marketplace',
        redirectTo: 'dashboard'
      }
    ]
  },
  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
