import type { Profile } from '../types';

export interface UsersService {
  getProfile(username: string): Promise<Profile>;
}
