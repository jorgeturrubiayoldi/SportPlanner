import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ConceptService, Concept } from '../core/services/concept.service';
import { CreateConceptModalComponent } from '../concepts/modals/create-concept-modal/create-concept-modal.component';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, TranslateModule, CreateConceptModalComponent],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent implements OnInit {
  private conceptService = inject(ConceptService);
  private router = inject(Router);

  // Estado de UI
  protected loading = signal(true);
  
  // Datos
  protected exercises = signal<Concept[]>([]);
  
  // Modals
  protected showModal = signal(false);
  protected editingExercise = signal<Concept | null>(null);

  async ngOnInit() {
    await this.loadExercises();
  }

  async loadExercises() {
    this.loading.set(true);
    try {
      // Por ahora cargamos todos los conceptos, pero en el futuro podríamos filtrar por tipo "ejercicio"
      const concepts = await this.conceptService.getAllConcepts();
      this.exercises.set(concepts);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getDifficultyStars(level: number): string {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  }

  getDifficultyColor(level: number): string {
    if (level <= 2) return 'text-green-500';
    if (level <= 3) return 'text-yellow-500';
    return 'text-red-500';
  }

  openModal(exercise?: Concept) {
    this.editingExercise.set(exercise || null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingExercise.set(null);
  }

  async onExerciseSaved() {
    this.closeModal();
    await this.loadExercises();
  }

  goToWhiteboard() {
    this.router.navigate(['/ejercicios/pizarra']);
  }
}
