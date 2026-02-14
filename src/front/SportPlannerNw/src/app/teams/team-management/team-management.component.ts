import { Component, computed, inject, signal, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TeamService, Team, TeamSeason } from '../../core/services/team.service';
import { SeasonService } from '../../core/services/season.service';
import { AuthService } from '../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Tab = 'players' | 'planning' | 'calendar';

import { CreatePlayerModalComponent } from '../../shared/components/create-player-modal/create-player-modal.component';
import { PlanService, Plan } from '../../core/services/plan.service';
import { CreatePlanModalComponent } from '../../shared/components/create-plan-modal/create-plan-modal.component';
import { TeamCalendarComponent } from '../../shared/components/team-calendar/team-calendar.component';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, CreatePlayerModalComponent, CreatePlanModalComponent, TeamCalendarComponent],
  templateUrl: './team-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);
  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);
  private planService = inject(PlanService);
  private destroyRef = inject(DestroyRef);

  teamId = signal<string>('');
  currentTab = signal<Tab>('players');
  
  team = signal<Team | undefined>(undefined);
  teamSeasons = signal<TeamSeason[]>([]);
  activeSeasonId = signal<string | undefined>(undefined);
  
  // Players Data
  players = signal<any[]>([]);
  loadingPlayers = signal<boolean>(false);
  showCreatePlayerModal = signal<boolean>(false);

  // Plans Data
  plans = signal<Plan[]>([]);
  loadingPlans = signal<boolean>(false);
  showCreatePlanModal = signal<boolean>(false);

  teamHeaderInfo = computed(() => {
    const t = this.team();
    if (!t) return 'Loading...';

    const seasons = this.teamSeasons();
    const activeSid = this.activeSeasonId();
    
    // Try to find the season config for the active season
    const currentSeasonConfig = seasons.find(ts => ts.seasonId === activeSid);

    let info = t.name;
    
    if (currentSeasonConfig) {
      info += ` - ${currentSeasonConfig.category}`;
      if (currentSeasonConfig.division) {
        info += ` - ${currentSeasonConfig.division}`;
      }
    }
    
    return info;
  });

  tabs = signal<{ id: Tab; label: string; icon: string }[]>([
    { id: 'players', label: 'TEAMS.MANAGEMENT.TABS.PLAYERS', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    { id: 'planning', label: 'TEAMS.MANAGEMENT.TABS.PLANNING', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>' },
    { id: 'calendar', label: 'TEAMS.MANAGEMENT.TABS.CALENDAR', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  ]);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        this.teamId.set(params.get('id') || '');
      });
  }

  async ngOnInit() {
    // 1. Get active season to know which context we are in
    const user = this.authService.currentUser();
    if (user) {
        const season = await this.seasonService.getActiveSeason(user.id);
        if (season) {
            this.activeSeasonId.set(season.id);
        }
    }

    const tId = this.teamId();
    if (tId) {
        // 2. Load team execution
        const t = await this.teamService.getTeamById(tId);
        this.team.set(t);

        const seasons = await this.teamService.getTeamSeasons(tId);
        this.teamSeasons.set(seasons);
        
        // 3. Load Data
        this.loadPlayers();
        this.loadPlans();
    }
  }

  async loadPlayers() {
     const tId = this.teamId();
     if (!tId) return;

     this.loadingPlayers.set(true);
     try {
       const players = await this.teamService.getPlayersByTeam(tId);
       this.players.set(players);
     } catch (error) {
       console.error('Error loading players', error);
     } finally {
       this.loadingPlayers.set(false);
     }
  }

  async loadPlans() {
    const tId = this.teamId();
    if (!tId) return;

    this.loadingPlans.set(true);
    try {
      const plans = await this.planService.getPlansByTeam(tId);
      this.plans.set(plans);
    } catch (error) {
      console.error('Error loading plans', error);
    } finally {
      this.loadingPlans.set(false);
    }
 }

  openCreatePlayerModal() {
    this.showCreatePlayerModal.set(true);
  }

  closeCreatePlayerModal() {
    this.showCreatePlayerModal.set(false);
  }

  onPlayerCreated() {
    this.loadPlayers();
  }

  openCreatePlanModal() {
    this.showCreatePlanModal.set(true);
  }

  closeCreatePlanModal() {
    this.showCreatePlanModal.set(false);
  }

  onPlanCreated() {
    this.loadPlans();
  }

  setTab(tab: Tab) {
    this.currentTab.set(tab);
  }
}
