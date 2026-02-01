import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

// ============================================
// Interfaces para Categorías de Conceptos
// ============================================

export interface ConceptCategory {
  id: string;
  sportId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  sortOrder: number;
  isSystem: boolean;
  active: boolean;
  children?: ConceptCategory[];
}

export interface CreateConceptCategoryRequest {
  sportId: string;
  parentId?: string | null;
  name: string;
  description?: string | null;
  sortOrder?: number;
}

export interface UpdateConceptCategoryRequest {
  name: string;
  description?: string | null;
  sortOrder: number;
  active: boolean;
}

// ============================================
// Interfaces para Conceptos
// ============================================

export interface Concept {
  id: string;
  conceptCategoryId: string;
  subscriptionId: string | null;
  name: string;
  description: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  difficultyLevel: number;
  isSystem: boolean;
  active: boolean;
  categoryName?: string;
}

export interface CreateConceptRequest {
  conceptCategoryId: string;
  subscriptionId?: string | null;
  name: string;
  description?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  difficultyLevel?: number;
}

export interface UpdateConceptRequest {
  conceptCategoryId: string;
  name: string;
  description?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  difficultyLevel: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConceptService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Concept`;

  // ============================================
  // Métodos de Categorías
  // ============================================

  /**
   * Obtiene el árbol de categorías de conceptos para un deporte
   */
  async getCategoriesTree(sportId: string): Promise<ConceptCategory[]> {
    try {
      return await firstValueFrom(
        this.http.get<ConceptCategory[]>(`${this.apiUrl}/categories/${sportId}`)
      ) || [];
    } catch (error) {
      console.error('Error fetching concept categories:', error);
      return [];
    }
  }

  /**
   * Obtiene una categoría por su ID
   */
  async getCategoryById(id: string): Promise<ConceptCategory | null> {
    try {
      return await firstValueFrom(
        this.http.get<ConceptCategory>(`${this.apiUrl}/categories/detail/${id}`)
      );
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  /**
   * Crea una nueva categoría de concepto
   */
  async createCategory(request: CreateConceptCategoryRequest): Promise<ConceptCategory> {
    return await firstValueFrom(
      this.http.post<ConceptCategory>(`${this.apiUrl}/categories`, request)
    );
  }

  /**
   * Actualiza una categoría de concepto
   */
  async updateCategory(id: string, request: UpdateConceptCategoryRequest): Promise<ConceptCategory> {
    return await firstValueFrom(
      this.http.put<ConceptCategory>(`${this.apiUrl}/categories/${id}`, request)
    );
  }

  /**
   * Elimina una categoría de concepto
   */
  async deleteCategory(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/categories/${id}`)
    );
  }

  // ============================================
  // Métodos de Conceptos
  // ============================================

  /**
   * Obtiene conceptos de una categoría específica
   */
  async getConceptsByCategory(categoryId: string): Promise<Concept[]> {
    try {
      return await firstValueFrom(
        this.http.get<Concept[]>(`${this.apiUrl}/categories/${categoryId}/concepts`)
      ) || [];
    } catch (error) {
      console.error('Error fetching concepts by category:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los conceptos (sistema + custom si se proporciona subscriptionId)
   */
  async getAllConcepts(subscriptionId?: string): Promise<Concept[]> {
    try {
      const params = subscriptionId ? `?subscriptionId=${subscriptionId}` : '';
      return await firstValueFrom(
        this.http.get<Concept[]>(`${this.apiUrl}${params}`)
      ) || [];
    } catch (error) {
      console.error('Error fetching all concepts:', error);
      return [];
    }
  }

  /**
   * Obtiene un concepto por su ID
   */
  async getConceptById(id: string): Promise<Concept | null> {
    try {
      return await firstValueFrom(
        this.http.get<Concept>(`${this.apiUrl}/${id}`)
      );
    } catch (error) {
      console.error('Error fetching concept:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo concepto
   */
  async createConcept(request: CreateConceptRequest): Promise<Concept> {
    return await firstValueFrom(
      this.http.post<Concept>(this.apiUrl, request)
    );
  }

  /**
   * Actualiza un concepto
   */
  async updateConcept(id: string, request: UpdateConceptRequest): Promise<Concept> {
    return await firstValueFrom(
      this.http.put<Concept>(`${this.apiUrl}/${id}`, request)
    );
  }

  /**
   * Elimina un concepto
   */
  async deleteConcept(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${id}`)
    );
  }

  // ============================================
  // Utilidades
  // ============================================

  /**
   * Aplana el árbol de categorías para obtener lista plana
   */
  flattenCategories(categories: ConceptCategory[]): ConceptCategory[] {
    const result: ConceptCategory[] = [];
    const flatten = (cats: ConceptCategory[]) => {
      for (const cat of cats) {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      }
    };
    flatten(categories);
    return result;
  }

  /**
   * Obtiene el nivel de profundidad de una categoría
   */
  getCategoryDepth(categoryId: string, categories: ConceptCategory[]): number {
    const flatCategories = this.flattenCategories(categories);
    let depth = 0;
    let currentId: string | null = categoryId;
    
    while (currentId) {
      const category = flatCategories.find(c => c.id === currentId);
      if (category && category.parentId) {
        depth++;
        currentId = category.parentId;
      } else {
        break;
      }
    }
    
    return depth;
  }
}
