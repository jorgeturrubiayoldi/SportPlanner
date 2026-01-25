import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeasonService } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-season-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-season-modal.component.html',
  styleUrls: ['./create-season-modal.component.scss']
})
export class CreateSeasonModalComponent {
  @Output() seasonCreated = new EventEmitter<void>();
  
  seasonName: string = '';
  startDate: string = new Date().toISOString().split('T')[0]; // Hoy por defecto
  loading: boolean = false;

  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  async onCreate() {
    this.loading = true;
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return;

      await this.seasonService.createSeason(user.id, this.seasonName, this.startDate);
      
      // Emitimos evento de éxito
      this.seasonCreated.emit();
      
    } catch (error) {
      console.error('Error creando temporada', error);
      alert('Hubo un error al crear la temporada. Inténtalo de nuevo.');
    } finally {
      this.loading = false;
    }
  }

  isValid(): boolean {
    return this.seasonName.trim().length > 0 && !!this.startDate;
  }

  async onLogout() {
    if (confirm('Si cierras sesión, no podrás acceder al sistema hasta crear una temporada. ¿Estás seguro?')) {
        await this.supabase.getClient().auth.signOut();
        this.router.navigate(['/auth/login']);
    }
  }
}
