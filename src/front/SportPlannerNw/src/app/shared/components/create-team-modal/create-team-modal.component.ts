import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../core/services/team.service';
import { SeasonService, Season } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { SubscriptionService } from '../../../core/services/subscription.service';

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-team-modal.component.html',
  styleUrls: ['./create-team-modal.component.scss']
})
export class CreateTeamModalComponent implements OnInit {
  @Output() teamCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Form Data
  name: string = '';
  birthYear: number | null = null;
  description: string = '';
  selectedCategory: Category | null = null;
  division: string = '';

  // State
  loading: boolean = false;
  loadingCategories: boolean = false;
  activeSeason: Season | null = null;
  errorMsg: string = '';

  // Options
  categories: Category[] = [];
  years: number[] = [];

  private teamService = inject(TeamService);
  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private subscriptionService = inject(SubscriptionService);
  private cdr = inject(import('@angular/core').ChangeDetectorRef);

  async ngOnInit() {
    console.log('Modal Init');
    this.generateYears();
    await this.loadActiveSeason();
    await this.loadCategories();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 30; i <= currentYear; i++) {
      this.years.push(i);
    }
    this.years.reverse();
  }

  async loadActiveSeason() {
    const user = this.authService.currentUser();
    if (user) {
      this.activeSeason = await this.seasonService.getActiveSeason(user.id);
      console.log('Active Season:', this.activeSeason);
    }
  }

  async loadCategories() {
    console.log('Loading Categories...');
    const user = this.authService.currentUser();
    if (!user) return;

    this.loadingCategories = true;
    try {
      // Obtener la suscripción activa para saber el sportId
      const subscription = await this.subscriptionService.getActiveSubscription(user.id);
      console.log('Subscription:', subscription);
      
      if (subscription) {
        this.categories = await this.categoryService.getCategoriesBySport(subscription.sportId);
        console.log('Categories Loaded:', this.categories);
        this.cdr.detectChanges(); // Forzar actualización de vista
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      this.loadingCategories = false;
      this.cdr.detectChanges();
    }
  }

  async onCreate() {
    if (!this.activeSeason) {
      this.errorMsg = 'No se encontró una temporada activa.';
      return;
    }

    if (!this.name || !this.selectedCategory) {
       this.errorMsg = 'Nombre y Categoría son obligatorios.';
       return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const teamRequest = {
        subscriptionId: this.activeSeason.subscriptionId,
        name: this.name,
        birthYear: this.birthYear || undefined,
        description: this.description
      };

      await this.teamService.createTeamAndAssignToSeason(
        teamRequest,
        this.activeSeason.id,
        this.selectedCategory.name, // Por ahora usamos el nombre, después migraremos a categoryId
        this.division
      );

      this.teamCreated.emit();
      this.close.emit();
      
    } catch (error: any) {
      console.error('Error creando equipo:', error);
      this.errorMsg = error.message || 'Error al crear el equipo.';
    } finally {
      this.loading = false;
    }
  }

  onClose() {
    this.close.emit();
  }

  // Helper to suggest category based on birth year
  onYearChange() {
    if (!this.birthYear || this.categories.length === 0) return;
    
    const suggested = this.categoryService.suggestCategory(this.birthYear, this.categories);
    if (suggested) {
      this.selectedCategory = suggested;
    }
  }
}
