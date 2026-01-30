import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Category {
  id: string;
  sportId: string;
  name: string;
  minBirthYear?: number;
  maxBirthYear?: number;
  sortOrder: number;
  isSystem: boolean;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Category`;

  /**
   * Obtiene todas las categorías activas de un deporte
   */
  async getCategoriesBySport(sportId: string): Promise<Category[]> {
    try {
      return await firstValueFrom(
        this.http.get<Category[]>(`${this.apiUrl}/sport/${sportId}`)
      ) || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Sugiere una categoría basándose en el año de nacimiento
   */
  suggestCategory(birthYear: number, categories: Category[]): Category | null {
    if (!birthYear || categories.length === 0) return null;

    // Buscar la categoría que contenga el año de nacimiento en su rango
    return categories.find(cat => {
      const minYear = cat.minBirthYear ?? 0;
      const maxYear = cat.maxBirthYear ?? 9999;
      return birthYear >= minYear && birthYear <= maxYear;
    }) || null;
  }
}
