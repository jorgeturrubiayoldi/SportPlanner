export interface Concept {
  id: string;
  conceptCategoryId: string;
  subscriptionId?: string;
  name: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  difficultyLevel: number;
  isSystem: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptCategory {
  id: string;
  sportId: string;
  name: string;
  description?: string;
}
