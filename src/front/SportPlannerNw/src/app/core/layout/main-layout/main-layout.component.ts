import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SeasonService, Season } from '../../services/season.service';
import { CreateSeasonModalComponent } from '../../../shared/components/create-season-modal/create-season-modal.component';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { UserSettingsModalComponent } from '../../../shared/components/user-settings-modal/user-settings-modal.component';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, CreateSeasonModalComponent, FormsModule, TranslateModule, LanguageSwitcherComponent, UserSettingsModalComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit {
  protected authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  protected seasonService = inject(SeasonService);
  private router = inject(Router);

  // Signals para UI state
  protected sidebarCollapsed = signal(false);
  protected mobileMenuOpen = signal(false);
  protected showSeasonModal = signal(false);
  protected showSettingsModal = signal(false);
  protected showUserMenu = signal(false);
  protected seasons = signal<any[]>([]);
  protected selectedSeason = signal<any | null>(null);
  protected expandedItems = signal<Set<string>>(new Set());

  // Items de navegación
  protected navItems = signal<NavItem[]>([
    { label: 'MENU.DASHBOARD', icon: 'grid', route: '/dashboard' },
    { label: 'MENU.PLANNING', icon: 'calendar', route: '/planificaciones' },
    { label: 'MENU.TEAMS', icon: 'users', route: '/equipos' },
    { label: 'MENU.EXERCISES', icon: 'activity', route: '/ejercicios' },
    { label: 'MENU.MARKETPLACE', icon: 'shopping-bag', route: '/marketplace' },
    { 
      label: 'MENU.SETTINGS', 
      icon: 'settings', 
      children: [
        { label: 'MENU.SEASONS', icon: 'calendar-range', route: '/ajustes/temporadas' },
        { label: 'MENU.CONCEPTS', icon: 'list', route: '/ajustes/conceptos' },
        { label: 'MENU.CATEGORIES', icon: 'tag', route: '/ajustes/categorias' }
      ]
    }
  ]);

  protected userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.fullName || user?.email?.split('@')[0] || 'Usuario';
  });

  async ngOnInit() {
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
    } else if (allSeasons.length === 0) {
      this.showSeasonModal.set(true);
    }
  }

  async onSeasonCreated() {
    this.showSeasonModal.set(false);
    const user = this.authService.currentUser();
    if (user?.id) {
      await this.loadSeasons(user.id);
    }
  }

  onSeasonChange(event: any) {
    const seasonId = event.target.value;
    const season = this.seasons().find(s => s.id === seasonId);
    if (season) {
      this.selectedSeason.set(season);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSettingsModal(): void {
    this.showSettingsModal.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  toggleSubmenu(label: string): void {
    const expanded = this.expandedItems();
    const newSet = new Set(expanded);
    if (newSet.has(label)) {
      newSet.delete(label);
    } else {
      newSet.add(label);
    }
    this.expandedItems.set(newSet);
  }

  isExpanded(label: string): boolean {
    return this.expandedItems().has(label);
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
  }
}
