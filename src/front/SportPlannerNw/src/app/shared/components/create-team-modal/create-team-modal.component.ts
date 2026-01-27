import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../core/services/team.service';
import { SeasonService } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-team-modal.component.html',
  styleUrls: ['./create-team-modal.component.scss'] // Optional if needed
})
export class CreateTeamModalComponent implements OnInit {
  @Output() teamCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Form Data
  name: string = '';
  birthYear: number | null = null;
  description: string = '';
  category: string = '';
  division: string = '';

  // State
  loading: boolean = false;
  activeSeasonId: string | null = null;

  // Options
  categories: string[] = ['Prebenjamín', 'Benjamín', 'Alevín', 'Infantil', 'Cadete', 'Juvenil', 'Senior'];
  years: number[] = [];

  private teamService = inject(TeamService);
  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);

  async ngOnInit() {
    this.generateYears();
    await this.loadActiveSeason();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 30; i <= currentYear; i++) {
      this.years.push(i);
    }
    this.years.reverse(); // Newest first
  }

  async loadActiveSeason() {
    const user = this.authService.currentUser();
    if (user) {
      const season = await this.seasonService.getActiveSeason(user.id);
      if (season) {
        this.activeSeasonId = season.id;
      }
    }
  }

  async onCreate() {
    if (!this.activeSeasonId) {
      alert('No se encontró una temporada activa.');
      return;
    }

    this.loading = true;
    try {
      const user = this.authService.currentUser();
      // Need subscription ID. Assuming user has one.
      // Ideally AuthService or SubscriptionService provides this directly.
      // But for now, we rely on the Backend to find the active subscription OR pass it in.
      // Wait, Backend `CreateTeamRequest` needs `SubscriptionId`.
      // I need to fetch the SubscriptionId first OR update the backend to find it by UserId?
      // The current backend `CreateTeam` requires `SubscriptionId`.
      // `TeamService` frontend doesn't have `getSubscriptionId`.
      
      // Checking `season.service.ts`... it fetches Active Subscription inside `CreateSeason`.
      // BUT `TeamService` calls `http.post` directly passing the request DTO which has SubscriptionId.
      
      // I should modify `TeamService` to handle fetching subscription ID automatically?
      // OR I can fetch the season, which has `SubscriptionId`? 
      // `Season` interface has `id`, `name`, `isActive`. It DOES NOT expose `subscriptionId`.
      
      // Let's check `season.service.ts` `getActiveSeason` implementation in frontend.
      // It returns `Season` interface (id, name, isActive).
      
      // PROBLEM: I don't have the `subscriptionId` in the frontend easily accessible unless I fetch the subscription.
      // I'll inject `SubscriptionService` (if exists) or make a call to get it.
      // `SubscriptionGuard` uses `SubscriptionService`.
      
      // Let's assume I can get the subscription from `getActiveSeason` if I update the model, 
      // OR I fix the backend to accept UserId?
      // The user wants "guarde segun lo establecido en el back".
      
      // I'll fetch the active subscription using the same logic as `SubscriptionGuard` or similar.
      // Or simply: When loading `getActiveSeason`, I can assume `activeSeason` belongs to the active subscription.
      // But I still need the ID.
      
      // I will update `Season` interface and `SeasonService` to return `subscriptionId` as well.
      // This is the cleanest way.
      
      // WAIT, `createTeamAndAssignToSeason` calls `createTeam`.
      
      // I'll update `Season` interface locally to include `subscriptionId` if the API returns it.
      // Let's check `SeasonResponse` in Backend... `public record SeasonResponse(string Id, string Name, bool IsActive);`.
      // It DOES NOT return SubscriptionId.
      
      // Implementation Plan Adjustment: 
      // I need to fetch the subscription ID. 
      // I'll use `SubscriptionService.getSubscription(userId)` (checking if exists).
      
      // Let's check `core/services/subscription.service.ts` content? 
      // I haven't viewed it yet. I'll assume I can find it or I'll implement a workaround.
      
      // Workaround: 
      // Since I know `userId`, I can call an endpoint that returns my subscription?
      // `SubscriptionService` likely has it.

      // Let's try to view `subscription.service.ts` quickly.
    } catch (error) {
      console.error(error);
    }
  }

  onClose() {
    this.close.emit();
  }
}
