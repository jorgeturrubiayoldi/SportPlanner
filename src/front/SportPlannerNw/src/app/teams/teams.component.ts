import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TeamService, TeamWithSeason } from '../core/services/team.service';
import { SeasonService } from '../core/services/season.service';
import { AuthService } from '../core/services/auth.service';
import { CreateTeamModalComponent } from '../shared/components/create-team-modal/create-team-modal.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateTeamModalComponent, TranslateModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);

  // Signals
  protected teams = signal<TeamWithSeason[]>([]);
  protected loading = signal(true);
  protected showCreateModal = signal(false);
  protected currentSeasonName = signal<string>('');

  async ngOnInit() {
    await this.loadTeams();
  }

  async loadTeams() {
    this.loading.set(true);
    try {
      const user = this.authService.currentUser();
      if (!user) return;

      const season = await this.seasonService.getActiveSeason(user.id);
      
      if (season) {
        this.currentSeasonName.set(season.name);
        const teamsData = await this.teamService.getTeamsBySeason(season.id);
        this.teams.set(teamsData);
      } else {
        this.currentSeasonName.set('Sin Temporada Activa');
        this.teams.set([]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onTeamCreated() {
    this.closeCreateModal();
    this.loadTeams();
  }
}
