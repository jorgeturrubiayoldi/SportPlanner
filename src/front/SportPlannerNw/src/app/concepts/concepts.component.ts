import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptService, ConceptCategory, Concept } from '../core/services/concept.service';
import { AuthService } from '../core/services/auth.service';
import { CreateConceptModalComponent } from './modals/create-concept-modal/create-concept-modal.component';
import { CreateCategoryModalComponent } from './modals/create-category-modal/create-category-modal.component';

@Component({
  selector: 'app-concepts',
  standalone: true,
  imports: [CommonModule, TranslateModule, CreateConceptModalComponent, CreateCategoryModalComponent],
  templateUrl: './concepts.component.html',
  styleUrl: './concepts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConceptsComponent implements OnInit {
  private conceptService = inject(ConceptService);
  private authService = inject(AuthService);

  // Estado de UI
  protected loading = signal(true);
  protected loadingConcepts = signal(false);
  
  // Datos
  protected categories = signal<ConceptCategory[]>([]);
  protected concepts = signal<Concept[]>([]);
  protected selectedCategory = signal<ConceptCategory | null>(null);
  protected expandedCategories = signal<Set<string>>(new Set());
  
  // Modales
  protected showConceptModal = signal(false);
  protected showCategoryModal = signal(false);
  protected editingConcept = signal<Concept | null>(null);
  protected editingCategory = signal<ConceptCategory | null>(null);

  // ID del deporte (basketball por defecto - TODO: hacer configurable)
  private readonly BASKETBALL_SPORT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading.set(true);
    try {
      const cats = await this.conceptService.getCategoriesTree(this.BASKETBALL_SPORT_ID);
      this.categories.set(cats);
      
      // Expandir todas las categorías raíz por defecto
      const expanded = new Set<string>();
      cats.forEach(c => expanded.add(c.id));
      this.expandedCategories.set(expanded);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async selectCategory(category: ConceptCategory) {
    this.selectedCategory.set(category);
    await this.loadConceptsForCategory(category.id);
  }

  async loadConceptsForCategory(categoryId: string) {
    this.loadingConcepts.set(true);
    try {
      const concepts = await this.conceptService.getConceptsByCategory(categoryId);
      this.concepts.set(concepts);
    } catch (error) {
      console.error('Error loading concepts:', error);
    } finally {
      this.loadingConcepts.set(false);
    }
  }

  toggleCategory(categoryId: string) {
    const expanded = new Set(this.expandedCategories());
    if (expanded.has(categoryId)) {
      expanded.delete(categoryId);
    } else {
      expanded.add(categoryId);
    }
    this.expandedCategories.set(expanded);
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories().has(categoryId);
  }

  getCategoryIcon(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ataque') || lowerName.includes('attack')) return '⚔️';
    if (lowerName.includes('defensa') || lowerName.includes('defense')) return '🛡️';
    if (lowerName.includes('tiro') || lowerName.includes('shoot')) return '🎯';
    if (lowerName.includes('bote') || lowerName.includes('dribble')) return '🏀';
    if (lowerName.includes('pase') || lowerName.includes('pass')) return '➡️';
    if (lowerName.includes('rebote') || lowerName.includes('rebound')) return '📥';
    return '📂';
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

  openCategoryModal(category?: ConceptCategory) {
    this.editingCategory.set(category || null);
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
    this.editingCategory.set(null);
  }

  async onConceptSaved() {
    this.closeConceptModal();
    const selected = this.selectedCategory();
    if (selected) {
      await this.loadConceptsForCategory(selected.id);
    }
  }

  async onCategorySaved() {
    this.closeCategoryModal();
    await this.loadCategories();
  }
}
