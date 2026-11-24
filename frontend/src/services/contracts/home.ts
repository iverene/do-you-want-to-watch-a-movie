import type { HomeSummary } from '../types';

export interface HomeService {
  get(): Promise<HomeSummary>;
  setNote(body: { mood?: string; statusNote?: string }): Promise<{ mood: string; statusNote: string }>;
}
