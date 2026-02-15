import { Concept } from './concept.model';

export interface Plan {
  id: string;
  subscriptionId: string;
  teamId?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  duration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanRequest {
  teamId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  duration?: number;
  conceptIds?: string[];
}

export interface PlanConcept {
  id: string;
  planId: string;
  conceptId: string;
  sortOrder: number;
  scheduledDate?: string;
  notes?: string;
  createdAt: string;
  concept?: Concept;
}

export interface AddConceptToPlanRequest {
  conceptId: string;
  scheduledDate?: string;
  notes?: string;
}
