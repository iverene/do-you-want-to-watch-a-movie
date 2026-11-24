import type { ManualTitleInput, Provider, Title, TypeFilter } from '../types';

export interface MoviesService {
  search(q: string, type: TypeFilter): Promise<{ items: Title[] }>;
  get(titleId: string): Promise<{ title: Title }>;
  createManual(input: ManualTitleInput): Promise<{ title: Title }>;
  providers(titleId: string, region: string): Promise<{ items: Provider[] }>;
}
