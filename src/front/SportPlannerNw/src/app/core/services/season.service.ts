import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Season {
  id: string;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Season`;

  async getActiveSeason(userId: string): Promise<Season | null> {
    try {
      // 204 No Content devuelve null automáticamente en HttpClient si se maneja bien,
      // pero a veces devuelve undefined o error. Manejamos try/catch.
      const result = await firstValueFrom(this.http.get<Season>(`${this.apiUrl}/active/${userId}`));
      return result || null;
    } catch (error) {
      // Si es 404 o 204 vacío, devolvemos null
      return null;
    }
  }

  async createSeason(userId: string, name: string, startDate: string, endDate?: string): Promise<Season> {
    return await firstValueFrom(this.http.post<Season>(this.apiUrl, {
      userId,
      name,
      startDate,
      endDate: endDate || null
    }));
  }
}
