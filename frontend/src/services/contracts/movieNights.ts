import type { MovieNight } from '../types';

export interface MovieNightsService {
  list(): Promise<{ items: MovieNight[] }>;
  create(body: { titleId: string; date: string }): Promise<{ night: MovieNight }>;
  update(id: string, body: { status: 'accepted' | 'declined' }): Promise<{ night: MovieNight }>;
}
