import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptService, ConceptCategory, Concept } from '../core/services/concept.service';
import { AuthService } from '../core/services/auth.service';
import { CreateConceptModalComponent } from './modals/create-concept-modal/create-concept-modal.component';


@Component({
  selector: 'app-concepts',
  standalone: true,
  imports: [CommonModule, TranslateModule, CreateConceptModalComponent],
  templateUrl: './concepts.component.html',
  styleUrl: './concepts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConceptsComponent implements OnInit {
  private conceptService = inject(ConceptService);
  private authService = inject(AuthService);

  // Estado de UI
  protected loading = signal(true);
  
  // Datos
  protected concepts = signal<Concept[]>([]);
  
  // Modals
  protected showConceptModal = signal(false);
  protected editingConcept = signal<Concept | null>(null);

  // ID del deporte (basketball por defecto - TODO: hacer configurable)
  private readonly BASKETBALL_SPORT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  async ngOnInit() {
    await this.loadConcepts();
  }

  async loadConcepts() {
    this.loading.set(true);
    try {
      const concepts = await this.conceptService.getAllConcepts();
      this.concepts.set(concepts);
    } catch (error) {
      console.error('Error loading concepts:', error);
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



  // Modal handlers
  openConceptModal(concept?: Concept) {
    this.editingConcept.set(concept || null);
    this.showConceptModal.set(true);
  }

  closeConceptModal() {
    this.showConceptModal.set(false);
    this.editingConcept.set(null);
  }

  async onConceptSaved() {
    this.closeConceptModal();
    await this.loadConcepts();
  }


}
