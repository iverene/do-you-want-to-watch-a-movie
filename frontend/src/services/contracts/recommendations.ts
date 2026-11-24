import type { Recommendation, RecommendationFor, TypeFilter } from '../types';

export interface RecommendationsResult {
  top: Recommendation | null;
  items: Recommendation[];
}

export interface RecommendationsService {
  get(q: { for: RecommendationFor; type: TypeFilter }): Promise<RecommendationsResult>;
  refresh(body: { for: RecommendationFor }): Promise<RecommendationsResult>;
}
