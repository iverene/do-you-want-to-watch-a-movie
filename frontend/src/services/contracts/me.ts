import type { Avatar, Screening, User } from '../types';

export interface MeService {
  update(body: { displayName?: string; theme?: 'light' | 'dark' }): Promise<{ user: User }>;
  setAvatar(avatar: Avatar): Promise<{ user: User }>;
  setGenres(body: { genreIds: string[] }): Promise<{ user: User }>;
  setTopFive(body: { screeningIds: (string | null)[] }): Promise<{ topFive: (Screening | null)[] }>;
  changePassword(body: { currentPassword: string; newPassword: string }): Promise<void>;
}
