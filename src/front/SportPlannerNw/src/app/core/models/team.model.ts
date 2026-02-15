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

export interface TeamSeason {
  id: string;
  teamId: string;
  seasonId: string;
  category: string;
  division?: string;
}

export interface CreateTeamSeasonRequest {
  teamId: string;
  seasonId: string;
  category: string;
  division?: string;
}
