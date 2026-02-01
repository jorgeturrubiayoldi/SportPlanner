import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlanService } from '../../../core/services/plan.service';

@Component({
  selector: 'app-create-plan-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-plan-modal.component.html',
  styleUrl: './create-plan-modal.component.scss'
})
export class CreatePlanModalComponent {
  @Input({ required: true }) teamId!: string;
  @Output() planCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Form Data
  name = '';
  description = '';
  startDate = '';
  endDate = '';

  // State
  loading = false;
  errorMsg = '';

  private planService = inject(PlanService);

  async onCreate() {
    if (!this.teamId) return;

    if (!this.name || !this.startDate || !this.endDate) {
       this.errorMsg = 'TEAMS.ERRORS.REQUIRED_FIELDS'; // reusing existing error key
       return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
        const planRequest = {
          teamId: this.teamId,
          name: this.name,
          description: this.description || undefined,
          startDate: this.startDate,
          endDate: this.endDate
        };

      await this.planService.createPlan(planRequest);

      this.planCreated.emit();
      this.close.emit();
      
    } catch (error: any) {
      console.error('Error creating plan:', error);
      this.errorMsg = 'TEAMS.ERRORS.CREATE_ERROR'; // reusing existing error key
    } finally {
      this.loading = false;
    }
  }

  onClose() {
    this.close.emit();
  }
}
