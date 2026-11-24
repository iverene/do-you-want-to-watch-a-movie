import type { ImportRow, ImportRowPatch } from '../types';

export interface ImportService {
  upload(file: File): Promise<{ rows: ImportRow[] }>;
  updateRow(id: string, body: ImportRowPatch): Promise<{ row: ImportRow }>;
  confirm(): Promise<{ imported: number; skipped: number }>;
}
