import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { FormsModule } from '@angular/forms';
import { SeasonService, Season } from '../core/services/season.service';
import { CreateSeasonModalComponent } from '../shared/components/create-season-modal/create-season-modal.component';

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

interface NavItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CreateSeasonModalComponent, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  protected seasonService = inject(SeasonService);
  private router = inject(Router);

  // Signals para UI state
  protected sidebarCollapsed = signal(false);
  protected mobileMenuOpen = signal(false);
  protected showSeasonModal = signal(false); // Controla el modal
  protected seasons = signal<any[]>([]);
  protected selectedSeason = signal<any | null>(null);

  async ngOnInit() {
    // Verificar si el usuario tiene una temporada activa
    const user = this.authService.currentUser();
    if (user?.id) {
      await this.loadSeasons(user.id);
    }
  }

  async loadSeasons(userId: string) {
    const allSeasons = await this.seasonService.getSeasons(userId);
    this.seasons.set(allSeasons);
    
    const active = allSeasons.find(s => s.isActive);
    if (active) {
      this.selectedSeason.set(active);
      console.log('Dashboard: Active season found:', active.name);
    } else if (allSeasons.length === 0) {
      console.warn('Dashboard: No active season found. Prompting creation.');
      this.showSeasonModal.set(true);
    }
  }

  async onSeasonCreated() {
    this.showSeasonModal.set(false);
    const user = this.authService.currentUser();
    if (user?.id) {
      await this.loadSeasons(user.id);
    }
    console.log('Temporada creada con éxito. Dashboard actualizado.');
  }

  onSeasonChange(event: any) {
    const seasonId = event.target.value;
    const season = this.seasons().find(s => s.id === seasonId);
    if (season) {
      this.selectedSeason.set(season);
      console.log('Season changed to:', season.name);
      // Aquí se podrían recargar los datos del dashboard filtrados por temporada
    }
  }

  // Computed para obtener el nombre del usuario
  protected userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.fullName || user?.email?.split('@')[0] || 'Usuario';
  });

  // Datos de estadísticas (mock data - en producción vendría de un servicio)
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

  // Items de navegación con identificadores para iconos SVG
  protected navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'grid', route: '/dashboard', active: true },
    { label: 'Planificaciones', icon: 'calendar', route: '/planificaciones', active: false },
    { label: 'Equipos', icon: 'users', route: '/equipos', active: false },
    { label: 'Ejercicios', icon: 'activity', route: '/ejercicios', active: false },
    { label: 'Marketplace', icon: 'shopping-bag', route: '/marketplace', active: false }
  ]);

  protected quickActions = signal([
    { label: 'Nueva Planificación', icon: 'plus-circle', primary: true },
    { label: 'Crear Equipo', icon: 'user-plus', primary: false },
    { label: 'Añadir Ejercicio', icon: 'database', primary: false }
  ]);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
  }

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
}
