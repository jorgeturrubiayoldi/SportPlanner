import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CreateTeamRequest, CreateTeamSeasonRequest, Team, TeamSeason, TeamWithSeason, TeamGender } from '../models/team.model';
import { CreatePlayerRequest, Player } from '../models/player.model';

export type { CreateTeamRequest, CreateTeamSeasonRequest, Team, TeamSeason, TeamWithSeason, TeamGender };

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

  async getTeamById(teamId: string): Promise<Team | undefined> {
    try {
      return await firstValueFrom(this.http.get<Team>(`${this.apiUrl}/${teamId}`));
    } catch (error) {
      console.error('Error fetching team by id:', error);
      return undefined;
    }
  }
  
  async getTeamSeasons(teamId: string): Promise<TeamSeason[]> {
    try {
      return await firstValueFrom(this.http.get<TeamSeason[]>(`${this.apiUrl}/${teamId}/seasons`)) || [];
    } catch (error) {
      console.error('Error fetching team seasons:', error);
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

  async assignTeamToSeason(request: CreateTeamSeasonRequest): Promise<TeamSeason> {
    return await firstValueFrom(this.http.post<TeamSeason>(`${this.apiUrl}/season`, request));
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
  // --- Player Operations ---
  
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    try {
      return await firstValueFrom(this.http.get<Player[]>(`${environment.apiUrl}/Player/team/${teamId}`)) || [];
    } catch (error) {
      console.error('Error fetching players:', error);
      return [];
    }
  }

  async createPlayer(playerData: CreatePlayerRequest): Promise<Player> {
    return await firstValueFrom(this.http.post<Player>(`${environment.apiUrl}/Player`, playerData));
  }

  async deletePlayer(playerId: string): Promise<void> {
     await firstValueFrom(this.http.delete(`${environment.apiUrl}/Player/${playerId}`));
  }
}
