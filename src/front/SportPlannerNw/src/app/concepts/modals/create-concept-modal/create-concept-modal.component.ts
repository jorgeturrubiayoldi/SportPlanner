import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Concept, ConceptCategory, ConceptService } from '../../../core/services/concept.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-concept-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-concept-modal.component.html',
  styles: []
})
export class CreateConceptModalComponent implements OnChanges, OnInit {
  @Input() concept: Concept | null = null;
  @Input() category: ConceptCategory | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() conceptSaved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private conceptService = inject(ConceptService);
  private authService = inject(AuthService);

  protected form: FormGroup;
  protected loading = signal(false);
  protected isEditMode = signal(false);
  protected categories = signal<ConceptCategory[]>([]);

  // Sport ID hardcoded for now as in other components
  private readonly BASKETBALL_SPORT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  constructor() {
    this.form = this.fb.group({
      conceptCategoryId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      videoUrl: [''],
      imageUrl: [''],
      difficultyLevel: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    try {
      const tree = await this.conceptService.getCategoriesTree(this.BASKETBALL_SPORT_ID);
      const flat = this.conceptService.flattenCategories(tree);
      this.categories.set(flat);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['concept'] && this.concept) {
      this.isEditMode.set(true);
      this.form.patchValue({
        conceptCategoryId: this.concept.conceptCategoryId,
        name: this.concept.name,
        description: this.concept.description,
        videoUrl: this.concept.videoUrl,
        imageUrl: this.concept.imageUrl,
        difficultyLevel: this.concept.difficultyLevel
      });
    } else {
      this.isEditMode.set(false);
      this.form.reset({
        difficultyLevel: 1,
        conceptCategoryId: this.category?.id || ''
      });
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const formValue = this.form.value;
      const user = this.authService.currentUser();
      
      const subscriptionId = (user as any)?.subscriptionId || null;

      if (this.isEditMode() && this.concept) {
        await this.conceptService.updateConcept(this.concept.id, {
          conceptCategoryId: formValue.conceptCategoryId,
          name: formValue.name,
          description: formValue.description,
          videoUrl: formValue.videoUrl,
          imageUrl: formValue.imageUrl,
          difficultyLevel: formValue.difficultyLevel,
          active: this.concept.active
        });
      } else {
        await this.conceptService.createConcept({
          conceptCategoryId: formValue.conceptCategoryId,
          subscriptionId: subscriptionId,
          name: formValue.name,
          description: formValue.description,
          videoUrl: formValue.videoUrl,
          imageUrl: formValue.imageUrl,
          difficultyLevel: formValue.difficultyLevel
        });
      }

      this.conceptSaved.emit();
    } catch (error) {
      console.error('Error saving concept:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      this.loading.set(false);
    }
  }

  onClose() {
    this.close.emit();
  }
}
