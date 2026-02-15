export interface Player {
  id: string;
  teamId: string;
  name: string;
  lastName?: string;
  email?: string;
  position?: string;
  number?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerRequest {
  teamId: string;
  name: string;
  lastName?: string;
  email?: string;
  position?: string;
  number?: number;
}
