import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeasonService, Season } from '../../core/services/season.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateSeasonModalComponent } from '../../shared/components/create-season-modal/create-season-modal.component';

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [CommonModule, TranslateModule, CreateSeasonModalComponent],
  templateUrl: './seasons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsComponent implements OnInit {
  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  seasons = signal<Season[]>([]);
  activeSeasonId = signal<string | null>(null);
  showCreateModal = signal(false);
  seasonToEdit = signal<Season | null>(null);
  isLoading = signal(false);
  userId: string = '';

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.userId = user.id;
      await this.loadSeasons();
    }
  }

  async loadSeasons() {
    this.isLoading.set(true);
    try {
      const seasons = await this.seasonService.getSeasons(this.userId);
      this.seasons.set(seasons);
      const active = seasons.find(s => s.isActive);
      this.activeSeasonId.set(active ? active.id : null);
    } catch (error) {
      console.error('Error loading seasons:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async setActive(season: Season) {
    if (season.isActive) return;

    try {
      const updatedSeason = await this.seasonService.setActiveSeason(this.userId, season.id);
      
      // Update local state primarily for immediate feedback
      this.seasons.update(current => 
        current.map(s => ({
          ...s,
          isActive: s.id === season.id
        }))
      );
      this.activeSeasonId.set(season.id);
      
    } catch (error) {
      console.error('Error setting active season:', error);
    }
  }

  // Modal Actions
  openCreateModal() {
    this.seasonToEdit.set(null);
    this.showCreateModal.set(true);
  }

  openEditModal(season: Season) {
    this.seasonToEdit.set(season);
    this.showCreateModal.set(true);
  }

  async onSeasonSaved(season: Season) {
    // Update local state immediately
    this.seasons.update(current => {
      const index = current.findIndex(s => s.id === season.id);
      if (index > -1) {
        // Update existing
        const updated = [...current];
        updated[index] = season;
        
        // If updating the active season, ensure IDs match for active check
        if (season.isActive) {
          this.activeSeasonId.set(season.id);
        }
        
        return updated;
      } else {
        // Create new
        return [...current, season];
      }
    });

    this.showCreateModal.set(false);
    this.seasonToEdit.set(null);
  }  

  async onSeasonCreated(season: Season) {
    this.showCreateModal.set(false);
    await this.loadSeasons();
    
    // If it's the first season, it might be auto-active or we might want to set it active
    if (this.seasons().length === 1) {
      this.activeSeasonId.set(season.id);
    }
  }
}
