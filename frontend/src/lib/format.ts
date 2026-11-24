import type { MediaType, Title } from '@/services';

export const typeLabel = (t: MediaType) => (t === 'movie' ? 'Movie' : 'Series');

export function runtime(min: number | null): string | null {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
}

/** "2019 · Movie · Romance" */
export function titleMeta(t: Title, opts: { genre?: boolean } = { genre: true }): string {
  return [t.year, typeLabel(t.mediaType), opts.genre ? t.genres[0]?.name : null].filter(Boolean).join(' · ');
}

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
