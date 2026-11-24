import type {
  CalendarDay,
  CreateScreeningBody,
  HistoryEntry,
  RateBody,
  Scope,
  Screening,
  ScreeningFilters,
  UpdateScreeningBody,
} from '../types';

export interface ScreeningsService {
  list(f: ScreeningFilters): Promise<{ items: Screening[]; total: number }>;
  calendar(month: string, scope: Scope): Promise<{ days: CalendarDay[]; undatedCount: number }>;
  get(id: string): Promise<{ screening: Screening; history: HistoryEntry[] }>;
  create(body: CreateScreeningBody): Promise<{ screening: Screening }>;
  update(id: string, body: UpdateScreeningBody): Promise<{ screening: Screening }>;
  remove(id: string): Promise<void>;
  rate(id: string, body: RateBody): Promise<{ screening: Screening }>;
}
