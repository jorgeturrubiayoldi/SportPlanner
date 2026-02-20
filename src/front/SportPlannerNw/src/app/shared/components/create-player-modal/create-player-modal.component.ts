import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-create-player-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-player-modal.component.html',
  styleUrl: './create-player-modal.component.scss'
})
export class CreatePlayerModalComponent {
  @Input({ required: true }) teamId!: string;
  @Output() playerCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Form Data
  name = '';
  lastName = '';
  email = '';
  position = '';
  number: number | null = null;

  // State
  loading = false;
  errorMsg = '';

  private teamService = inject(TeamService);

  async onCreate() {
    if (!this.teamId) return;

    if (!this.name) {
       this.errorMsg = 'TEAMS.ERRORS.REQUIRED_FIELDS'; // Reuse generic error or create specific
       return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
        const playerRequest = {
          teamId: this.teamId,
          name: this.name,
          lastName: this.lastName || undefined,
          email: this.email || undefined,
          position: this.position || undefined,
          number: this.number || undefined
        };

      await this.teamService.createPlayer(playerRequest as any); // Temporary cast if needed, but undefined should work

      this.playerCreated.emit();
      this.close.emit();
      
    } catch (error: any) {
      console.error('Error creando jugador:', error);
      this.errorMsg = 'TEAMS.ERRORS.CREATE_ERROR';
    } finally {
      this.loading = false;
    }
  }

  onClose() {
    this.close.emit();
  }
}
