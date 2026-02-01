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
}

export interface CreatePlan {
  teamId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
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
}
