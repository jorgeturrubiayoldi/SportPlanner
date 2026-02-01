import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptService, ConceptCategory } from '../../core/services/concept.service';
import { CreateCategoryModalComponent } from '../modals/create-category-modal/create-category-modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, TranslateModule, CreateCategoryModalComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  private conceptService = inject(ConceptService);

  // States
  protected loading = signal(true);
  protected categories = signal<ConceptCategory[]>([]);
  protected selectedCategory = signal<ConceptCategory | null>(null);
  protected expandedCategories = signal<Set<string>>(new Set());

  // Modals
  protected showCategoryModal = signal(false);
  protected editingCategory = signal<ConceptCategory | null>(null);
  protected parentForNewCategory = signal<ConceptCategory | null>(null); // To create subcategory

  // ID del deporte (basketball por defecto - TODO: hacer configurable globalmente)
  private readonly BASKETBALL_SPORT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading.set(true);
    try {
      const cats = await this.conceptService.getCategoriesTree(this.BASKETBALL_SPORT_ID);
      this.categories.set(cats);
      
      // Expand root categories by default
      const expanded = new Set<string>();
      cats.forEach(c => expanded.add(c.id));
      this.expandedCategories.set(expanded);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      this.loading.set(false);
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

  selectCategory(category: ConceptCategory) {
    this.selectedCategory.set(category);
  }



  // Actions
  openCreateModal(parentCategory?: ConceptCategory) {
    this.editingCategory.set(null);
    this.parentForNewCategory.set(parentCategory || null);
    this.showCategoryModal.set(true);
  }

  openEditModal(category: ConceptCategory) {
    this.editingCategory.set(category);
    this.parentForNewCategory.set(null); // Editing doesn't need parent set explicitly usually, or it depends on backend
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
    this.editingCategory.set(null);
    this.parentForNewCategory.set(null);
  }

  async onCategorySaved() {
    this.closeCategoryModal();
    await this.loadCategories();
  }
}
