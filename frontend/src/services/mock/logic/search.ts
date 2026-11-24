import type { Title, TypeFilter } from '../../types';

/** Catalog search: case-insensitive "contains" on the title, plus a type filter. Max 10. */
export function searchTitles(titles: Title[], q: string, type: TypeFilter = 'all', limit = 10): Title[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return titles
    .filter((t) => (type === 'all' || t.mediaType === type) && t.title.toLowerCase().includes(needle))
    .sort((a, b) => rank(a, needle) - rank(b, needle) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

function rank(t: Title, needle: string): number {
  const name = t.title.toLowerCase();
  if (name === needle) return 0;
  if (name.startsWith(needle)) return 1;
  return 2;
}
