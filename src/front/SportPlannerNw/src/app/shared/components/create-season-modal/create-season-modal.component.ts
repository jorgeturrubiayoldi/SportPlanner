import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeasonService, Season } from '../../../core/services/season.service';
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
  @Input() isOpen = false;
  @Input() isStandalone = false; // If true, shows Logout button instead of Cancel
  @Input() seasonToEdit: Season | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() seasonSaved = new EventEmitter<Season>();
  
  seasonName: string = '';
  startDate: string = new Date().toISOString().split('T')[0]; // Hoy por defecto
  endDate: string = '';
  loading: boolean = false;

  private seasonService = inject(SeasonService);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  ngOnChanges(): void {
    if (this.seasonToEdit) {
      this.seasonName = this.seasonToEdit.name;
      this.startDate = this.seasonToEdit.startDate.split('T')[0];
      this.endDate = this.seasonToEdit.endDate ? this.seasonToEdit.endDate.split('T')[0] : '';
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.seasonName = '';
    this.startDate = new Date().toISOString().split('T')[0];
    this.endDate = '';
  }

  async onSave() {
    this.loading = true;
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return;

      let result: Season;
      if (this.seasonToEdit) {
        result = await this.seasonService.updateSeason(user.id, this.seasonToEdit.id, this.seasonName, this.startDate, this.endDate);
      } else {
        result = await this.seasonService.createSeason(user.id, this.seasonName, this.startDate, this.endDate);
      }
      
      this.seasonSaved.emit(result);
      if(!this.seasonToEdit) this.resetForm();
      
    } catch (error) {
      console.error('Error guardando temporada', error);
      alert('Hubo un error al guardar la temporada.');
    } finally {
      this.loading = false;
    }
  }

  isValid(): boolean {
    return this.seasonName.trim().length > 0 && !!this.startDate && !!this.endDate;
  }

  async onLogout() {
    if (confirm('Si cierras sesión, no podrás acceder al sistema hasta crear una temporada. ¿Estás seguro?')) {
        await this.supabase.getClient().auth.signOut();
        this.router.navigate(['/auth/login']);
    }
  }

  onCancel() {
    this.closeModal.emit();
    this.resetForm();
  }
}
