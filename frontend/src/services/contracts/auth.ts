import type { LoginBody, User } from '../types';

export interface AuthService {
  login(body: LoginBody): Promise<{ user: User }>;
  logout(): Promise<void>;
  me(): Promise<{ user: User; partner: User }>;
}
