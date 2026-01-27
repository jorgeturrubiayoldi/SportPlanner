import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../core/services/team.service';
import { SeasonService, Season } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';

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
  category: string = '';
  division: string = '';

  // State
  loading: boolean = false;
  activeSeason: Season | null = null;
  errorMsg: string = '';

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
    this.years.reverse();
  }

  async loadActiveSeason() {
    const user = this.authService.currentUser();
    if (user) {
      this.activeSeason = await this.seasonService.getActiveSeason(user.id);
    }
  }

  async onCreate() {
    if (!this.activeSeason) {
      this.errorMsg = 'No se encontró una temporada activa.';
      return;
    }

    if (!this.name || !this.category) {
       this.errorMsg = 'Nombre y Categoría son obligatorios.';
       return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const teamRequest = {
        subscriptionId: this.activeSeason.subscriptionId,
        name: this.name,
        birthYear: this.birthYear || undefined, // undefined to send null if backend handles it
        description: this.description
      };

      await this.teamService.createTeamAndAssignToSeason(
        teamRequest,
        this.activeSeason.id,
        this.category,
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

  // Helper to suggested category
  onYearChange() {
    if (!this.birthYear) return;
    
    // Simple logic based on age (Current Year - Birth Year)
    // This could be moved to a utility or service
    const currentYear = new Date().getFullYear();
    const age = currentYear - this.birthYear;

    if (age <= 7) this.category = 'Prebenjamín';
    else if (age <= 9) this.category = 'Benjamín';
    else if (age <= 11) this.category = 'Alevín';
    else if (age <= 13) this.category = 'Infantil';
    else if (age <= 15) this.category = 'Cadete';
    else if (age <= 18) this.category = 'Juvenil';
    else this.category = 'Senior';
  }
}
