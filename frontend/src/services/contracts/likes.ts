import type { Title } from '../types';

/** Titles a user has hearted (♡). Separate from Top 5; shown as "Liked" on the profile. */
export interface LikesService {
  list(): Promise<{ items: Title[] }>;
  like(titleId: string): Promise<{ title: Title }>;
  unlike(titleId: string): Promise<void>;
}
