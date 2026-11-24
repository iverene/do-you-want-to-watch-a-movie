import type { Screening } from '@/services';

export type Group =
  | { kind: 'month'; key: string; month: string; items: Screening[] }
  | { kind: 'undated'; key: string; year: number; items: Screening[] };

/** Month groups, newest first; a year's imported year-only titles come after its dated months. */
export function groupScreenings(items: Screening[]): Group[] {
  const groups: Group[] = [];
  for (const s of items) {
    const last = groups[groups.length - 1];
    if (s.watchedOn) {
      const month = s.watchedOn.slice(0, 7);
      if (last?.kind === 'month' && last.month === month) last.items.push(s);
      else groups.push({ kind: 'month', key: month, month, items: [s] });
    } else if (last?.kind === 'undated' && last.year === s.watchedYear) last.items.push(s);
    else groups.push({ kind: 'undated', key: `undated-${s.watchedYear}`, year: s.watchedYear, items: [s] });
  }
  return groups;
}
