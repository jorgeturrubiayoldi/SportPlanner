import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AddConceptToPlanRequest, CreatePlanRequest, Plan, PlanConcept } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/plan`;

  async getPlansByTeam(teamId: string): Promise<Plan[]> {
    return firstValueFrom(this.http.get<Plan[]>(`${this.apiUrl}/team/${teamId}`));
  }

  async createPlan(plan: CreatePlanRequest): Promise<Plan> {
    return firstValueFrom(this.http.post<Plan>(this.apiUrl, plan));
  }

  async getPlanById(id: string): Promise<Plan> {
    return firstValueFrom(this.http.get<Plan>(`${this.apiUrl}/${id}`));
  }

  async addConceptToPlan(planId: string, conceptId: string, scheduledDate?: string, notes?: string): Promise<PlanConcept> {
    const request: AddConceptToPlanRequest = { conceptId, scheduledDate, notes };
    return firstValueFrom(this.http.post<PlanConcept>(`${this.apiUrl}/${planId}/concepts`, request));
  }

  async removeConceptFromPlan(planId: string, conceptId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${planId}/concepts/${conceptId}`));
  }

  async getPlanConcepts(planId: string): Promise<PlanConcept[]> {
    return firstValueFrom(this.http.get<PlanConcept[]>(`${this.apiUrl}/${planId}/concepts`));
  }
}
