import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'secondary' | 'accent';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface RecentPlan {
  id: string;
  name: string;
  team: string;
  date: Date;
  status: 'completed' | 'pending' | 'in-progress';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private router = inject(Router);

  // Datos de estadísticas (mock data)
  protected stats = signal<StatCard[]>([
    {
      title: 'Equipos',
      value: 3,
      icon: '👥',
      color: 'primary',
      trend: { value: 1, isPositive: true }
    },
    {
      title: 'Planificaciones Activas',
      value: 12,
      icon: '📋',
      color: 'secondary',
      trend: { value: 3, isPositive: true }
    },
    {
      title: 'Ejercicios Creados',
      value: 45,
      icon: '⚽',
      color: 'accent',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Conceptos Dominados',
      value: 28,
      icon: '🎯',
      color: 'primary',
      trend: { value: 5, isPositive: true }
    }
  ]);

  // Planificaciones recientes (mock data)
  protected recentPlans = signal<RecentPlan[]>([
    {
      id: '1',
      name: 'Entrenamiento Técnico - Semana 3',
      team: 'Alevín B',
      date: new Date('2026-01-23'),
      status: 'completed'
    },
    {
      id: '2',
      name: 'Sesión Táctica - Posesión',
      team: 'Infantil A',
      date: new Date('2026-01-22'),
      status: 'in-progress'
    },
    {
      id: '3',
      name: 'Preparación Física',
      team: 'Cadete A',
      date: new Date('2026-01-21'),
      status: 'pending'
    }
  ]);

  protected quickActions = signal([
    { label: 'Nueva Planificación', icon: 'plus-circle', primary: true, action: 'plan' },
    { label: 'Crear Equipo', icon: 'user-plus', primary: false, action: 'team' },
    { label: 'Añadir Ejercicio', icon: 'database', primary: false, action: 'exercise' }
  ]);

  getStatusColor(status: RecentPlan['status']): string {
    const colors = {
      'completed': 'bg-primary/10 text-primary border-primary/20',
      'in-progress': 'bg-secondary/10 text-secondary border-secondary/20',
      'pending': 'bg-muted text-muted-foreground border-border'
    };
    return colors[status];
  }

  getStatusLabel(status: RecentPlan['status']): string {
    const labels = {
      'completed': 'Completado',
      'in-progress': 'En curso',
      'pending': 'Pendiente'
    };
    return labels[status];
  }

  handleQuickAction(actionCode: string) {
    console.log('Quick Action:', actionCode);
    switch (actionCode) {
      case 'team':
        this.router.navigate(['/equipos']);
        break;
      case 'plan':
        this.router.navigate(['/planificaciones']);
        break;
      case 'exercise':
        this.router.navigate(['/ejercicios']);
        break;
      default:
        console.warn('Action not implemented:', actionCode);
    }
  }
}
