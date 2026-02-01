import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Plan {
  id: string;
  teamId?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  trainingDays?: string[];
  duration?: number;
}

export interface CreatePlan {
  teamId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  trainingDays?: string[];
  duration?: number;
  conceptIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/plan`;

  async getPlansByTeam(teamId: string): Promise<Plan[]> {
    return firstValueFrom(this.http.get<Plan[]>(`${this.apiUrl}/team/${teamId}`));
  }

  async createPlan(plan: CreatePlan): Promise<Plan> {
    return firstValueFrom(this.http.post<Plan>(this.apiUrl, plan));
  }

  async getPlanById(id: string): Promise<Plan> {
    return firstValueFrom(this.http.get<Plan>(`${this.apiUrl}/${id}`));
  }

  async addConceptToPlan(planId: string, conceptId: string, scheduledDate?: string, notes?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/${planId}/concepts`, { conceptId, scheduledDate, notes }));
  }

  async removeConceptFromPlan(planId: string, conceptId: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${planId}/concepts/${conceptId}`));
  }

  async getPlanConcepts(planId: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/${planId}/concepts`));
  }
}
