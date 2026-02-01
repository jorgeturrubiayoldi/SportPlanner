import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptCategory, ConceptService } from '../../../core/services/concept.service';

@Component({
  selector: 'app-create-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-category-modal.component.html',
  styles: [] // Reutilizar estilos si es posible
})
export class CreateCategoryModalComponent implements OnChanges {
  @Input() category: ConceptCategory | null = null;
  @Input() parentCategory: ConceptCategory | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() categorySaved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private conceptService = inject(ConceptService);

  protected form: FormGroup;
  protected loading = signal(false);
  protected isEditMode = signal(false);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.category) {
      this.isEditMode.set(true);
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description
      });
    } else {
      this.isEditMode.set(false);
      this.form.reset();
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const formValue = this.form.value;
      // SportId está hardcoded por ahora para simplificar, idealmente vendría del servicio o contexto global
      // El backend lo espera. Usaremos el sportId por defecto de la app o el del padre
      const sportId = this.parentCategory?.sportId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Default sport ID

      if (this.isEditMode() && this.category) {
        await this.conceptService.updateCategory(this.category.id, {
          name: formValue.name,
          description: formValue.description,
          sortOrder: this.category.sortOrder,
          active: this.category.active
        });
      } else {
        await this.conceptService.createCategory({
          sportId: sportId,
          parentId: this.parentCategory?.id,
          name: formValue.name,
          description: formValue.description
        });
      }

      this.categorySaved.emit();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onClose() {
    this.close.emit();
  }
}
