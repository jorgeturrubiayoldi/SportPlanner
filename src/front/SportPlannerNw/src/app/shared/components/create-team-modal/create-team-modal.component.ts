import { Component, EventEmitter, inject, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TeamService, TeamGender } from '../../../core/services/team.service';
import { SeasonService, Season } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { SubscriptionService } from '../../../core/services/subscription.service';

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.scss'
})
export class CreateTeamModalComponent implements OnInit {
  @Output() teamCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Form Data
  name = '';
  description = '';
  selectedCategory: Category | null = null;
  division = '';
  selectedGender: TeamGender | null = null;

  // State
  loading = false;
  loadingCategories = false;
  activeSeason: Season | null = null;
  errorMsg = '';

  // Options
  categories: Category[] = [];
  genderOptions: { value: TeamGender, label: string }[] = [
    { value: 'Male', label: 'TEAMS.GENDER.MALE' },
    { value: 'Female', label: 'TEAMS.GENDER.FEMALE' },
    { value: 'Mixed', label: 'TEAMS.GENDER.MIXED' }
  ];

  private teamService = inject(TeamService);
  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private subscriptionService = inject(SubscriptionService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    await this.loadActiveSeason();
    await this.loadCategories();
  }

  async loadActiveSeason() {
    const user = this.authService.currentUser();
    if (user) {
      this.activeSeason = await this.seasonService.getActiveSeason(user.id);
    }
  }

  async loadCategories() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.loadingCategories = true;
    try {
      const subscription = await this.subscriptionService.getActiveSubscription(user.id);
      
      if (subscription) {
        this.categories = await this.categoryService.getCategoriesBySport(subscription.sportId);
        this.cdr.detectChanges();
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
      this.errorMsg = 'TEAMS.ERRORS.NO_ACTIVE_SEASON';
      return;
    }

    if (!this.name || !this.selectedCategory || !this.selectedGender) {
       this.errorMsg = 'TEAMS.ERRORS.REQUIRED_FIELDS';
       return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
        const teamRequest = {
          subscriptionId: this.activeSeason.subscriptionId,
          name: this.name,
          gender: this.selectedGender!,
          description: this.description
        };

      await this.teamService.createTeamAndAssignToSeason(
        teamRequest,
        this.activeSeason.id,
        this.selectedCategory.name,
        this.division
      );

      this.teamCreated.emit();
      this.close.emit();
      
    } catch (error: any) {
      console.error('Error creando equipo:', error);
      this.errorMsg = 'TEAMS.ERRORS.CREATE_ERROR';
    } finally {
      this.loading = false;
    }
  }

  onClose() {
    this.close.emit();
  }
}
