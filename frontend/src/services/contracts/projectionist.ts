import type { Recommendation } from '../types';

export interface ProjectionistService {
  ask(body: { message: string }): Promise<{ reply: string; picks: Recommendation[] }>;
}
