import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export type TeamGender = 'Male' | 'Female' | 'Mixed';

export interface Team {
  id: string;
  subscriptionId: string;
  name: string;
  gender: TeamGender;
  birthYear?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamWithSeason {
  id: string;
  name: string;
  gender: TeamGender;
  birthYear?: number;
  description?: string;
  isActive: boolean;
  category: string;
  division?: string;
  seasonId: string;
  seasonName: string;
}

export interface CreateTeamRequest {
  subscriptionId: string;
  name: string;
  gender: TeamGender;
  birthYear?: number;
  description?: string;
}

export interface CreateTeamSeasonRequest {
  teamId: string;
  seasonId: string;
  category: string;
  division?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Team`;

  // --- Team Operations ---

  async getTeams(subscriptionId: string): Promise<Team[]> {
    try {
      return await firstValueFrom(this.http.get<Team[]>(`${this.apiUrl}/subscription/${subscriptionId}`)) || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  async getTeamsBySeason(seasonId: string): Promise<TeamWithSeason[]> {
    try {
      return await firstValueFrom(this.http.get<TeamWithSeason[]>(`${this.apiUrl}/season/${seasonId}`)) || [];
    } catch (error) {
      console.error('Error fetching teams by season:', error);
      return [];
    }
  }

  async createTeam(request: CreateTeamRequest): Promise<Team> {
    return await firstValueFrom(this.http.post<Team>(this.apiUrl, request));
  }

  async updateTeam(teamId: string, request: Partial<Team>): Promise<Team> {
    return await firstValueFrom(this.http.put<Team>(`${this.apiUrl}/${teamId}`, request));
  }

  async deleteTeam(teamId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${teamId}`));
  }

  // --- TeamSeason Operations (Assigning/Managing Categories) ---

  async assignTeamToSeason(request: CreateTeamSeasonRequest): Promise<any> {
    return await firstValueFrom(this.http.post(`${this.apiUrl}/season`, request));
  }

  // --- Composite Operations ---

  /**
   * Creates a team and immediately assigns it to a season with a category.
   * This is the standard flow when creating a team from the dashboard context.
   */
  async createTeamAndAssignToSeason(
    teamRequest: CreateTeamRequest, 
    seasonId: string, 
    category: string, 
    division?: string
  ): Promise<Team> {
    // 1. Create the team
    const team = await this.createTeam(teamRequest);
    
    // 2. Assign to season
    try {
      await this.assignTeamToSeason({
        teamId: team.id,
        seasonId: seasonId,
        category: category,
        division: division
      });
    } catch (error) {
      // If assignment fails, we should probably warn the user, but the team is created.
      console.error('Error assigning team to season immediately after creation:', error);
      // Optional: Rollback team creation? For now, we keep the team.
    }

    return team;
  }
}
