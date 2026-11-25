import type { ManualTitleInput, Title, TypeFilter } from '../types';

export interface MoviesService {
  search(q: string, type: TypeFilter): Promise<{ items: Title[] }>;
  get(titleId: string): Promise<{ title: Title }>;
  createManual(input: ManualTitleInput): Promise<{ title: Title }>;
}
