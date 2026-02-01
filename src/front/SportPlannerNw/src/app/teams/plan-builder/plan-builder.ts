import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../core/services/plan.service';
import { ConceptService } from '../../core/services/concept.service';

@Component({
  selector: 'app-plan-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './plan-builder.html',
  styleUrl: './plan-builder.scss',
})
export class PlanBuilder implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planService = inject(PlanService);
  private conceptService = inject(ConceptService);

  teamId: string = '';
  planId: string = '';
  
  plan = signal<any>(null);
  planConcepts = signal<any[]>([]);
  allConcepts = signal<any[]>([]);
  
  // UI State
  loading = signal(true);
  searchQuery = signal('');
  
  // Categorized Concepts Logic
  categorizedConcepts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const concepts = this.allConcepts().filter(c => 
      c.name.toLowerCase().includes(query)
    );

    // Group by Category -> Subcategory
    // This assumes concept has categoryName or we map it. 
    // Ideally we'd use the full category tree, but for now let's list them flat or simple group
    // For the "Premium Tree" UX, let's map concepts to a tree structure if we had Category IDs.
    // Since ConceptService returns flat concepts, we might need a better strategy, 
    // but let's start by grouping by 'categoryName'
    
    const groups: { [key: string]: any[] } = {};
    concepts.forEach(c => {
      const cat = c.categoryName || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });

    return Object.keys(groups).sort().map(cat => ({
      name: cat,
      concepts: groups[cat]
    }));
  });

  async ngOnInit() {
    this.teamId = this.route.snapshot.paramMap.get('teamId') || '';
    this.planId = this.route.snapshot.paramMap.get('planId') || '';

    if (!this.teamId || !this.planId) {
      this.goBack();
      return;
    }

    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [plan, concepts, planConcepts] = await Promise.all([
        this.planService.getPlanById(this.planId),
        this.conceptService.getAllConcepts(),
        this.planService.getPlanConcepts(this.planId)
      ]);

      this.plan.set(plan);
      this.allConcepts.set(concepts);
      this.planConcepts.set(planConcepts);
      
    } catch (error) {
      console.error('Error loading builder data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async addConcept(concept: any) {
    try {
        await this.planService.addConceptToPlan(this.planId, concept.id);
        // Optimistic update or reload
        await this.reloadPlanConcepts();
    } catch (error) {
        console.error('Error adding concept', error);
    }
  }

  async removeConcept(conceptId: string) {
      try {
          await this.planService.removeConceptFromPlan(this.planId, conceptId);
          await this.reloadPlanConcepts();
      } catch (error) {
          console.error('Error removing concept', error);
      }
  }

  async reloadPlanConcepts() {
      const concepts = await this.planService.getPlanConcepts(this.planId);
      this.planConcepts.set(concepts);
  }

  getConceptName(conceptId: string): string {
      const concept = this.allConcepts().find(c => c.id === conceptId);
      return concept ? concept.name : 'Unknown Concept';
  }

  getConceptCategory(conceptId: string): string {
     const concept = this.allConcepts().find(c => c.id === conceptId);
     return concept?.categoryName || '';
  }

  goBack() {
    this.router.navigate(['/teams', this.teamId, 'manage']);
  }
}
