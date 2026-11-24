import { serviceConfig } from '../../config';
import { db, seed } from '../db';
import { ALEX, SAM } from '../seed';
import { coupleStreak } from './couple';
import { buildRecommendations, scoreCandidates } from './recommendations';
import { searchTitles } from './search';
import { computeStats } from './stats';
import { parseCsv } from './csv';

afterAll(() => vi.useRealTimers());
beforeAll(() => {
  serviceConfig.mockLatencyMs = 0;
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-24T12:00:00+08:00'));
});
beforeEach(() => {
  localStorage.clear();
  seed();
});

describe('seeded streak', () => {
  it('is 6 weeks now, with a best of 9', () => {
    const s = coupleStreak(db(), '2026-11-24');
    expect(s.current).toBe(6);
    expect(s.best).toBe(9);
    expect(s.lastWeeks.filter(Boolean)).toHaveLength(6);
  });
});

describe('computeStats', () => {
  it('counts ours, together, genres and the undated imports', () => {
    const s = computeStats(db(), { scope: 'ours', year: 2026 }, ALEX, 2026);
    expect(s.total).toBe(18);
    expect(s.together).toBe(18);
    expect(s.solo).toBe(0);
    expect(s.byMonth.slice(7, 11).reduce((a, b) => a + b, 0)).toBe(18);
    expect(s.genres[0].count).toBeGreaterThanOrEqual(s.genres[1].count);
    expect(s.topRated.length).toBeLessThanOrEqual(4);
  });

  it('uses the personal stars in a personal scope', () => {
    const s = computeStats(db(), { scope: 'mine' }, SAM, 2026);
    for (const { screening, stars } of s.topRated) {
      expect(screening.ratings.find((r) => r.userId === SAM)?.stars).toBe(stars);
    }
  });

  it('puts year-only imports in undatedCount, not in months', () => {
    const s = computeStats(db(), { scope: 'ours', year: 2025 }, ALEX, 2026);
    expect(s.undatedCount).toBe(3);
    expect(s.byMonth.every((n) => n === 0)).toBe(true);
    expect(computeStats(db(), { scope: 'ours', year: 2025, month: 3 }, ALEX, 2026).total).toBe(0);
  });
});

describe('recommendations', () => {
  it('never recommends watched or watchlisted titles', () => {
    const d = db();
    const watched = new Set(d.screenings.map((s) => s.titleId));
    const listed = new Set(d.watchlist.map((w) => w.titleId));
    for (const c of scoreCandidates(d, null)) {
      expect(watched.has(c.title.id) || listed.has(c.title.id)).toBe(false);
    }
  });

  it('scores higher when genres were rated higher', () => {
    const scored = scoreCandidates(db(), null);
    for (let i = 1; i < scored.length; i++)
      expect(scored[i - 1].score).toBeGreaterThanOrEqual(scored[i].score);
  });

  it('explains picks with a rated title', () => {
    const { top, items } = buildRecommendations(db(), null, 'all', 0);
    expect(top).not.toBeNull();
    expect([top!, ...items].some((r) => /because you both/.test(r.reason))).toBe(true);
    expect(top!.matchPercent).toBeGreaterThanOrEqual(items[0]?.matchPercent ?? 0);
  });

  it('filters by type', () => {
    const { top, items } = buildRecommendations(db(), null, 'tv', 0);
    expect([top!, ...items].every((r) => r.title.mediaType === 'tv')).toBe(true);
  });
});

describe('searchTitles', () => {
  it('matches case-insensitive substrings and filters type', () => {
    expect(searchTitles(db().titles, 'paper', 'all').map((t) => t.title)).toContain('Paper Moons');
    expect(searchTitles(db().titles, 'paper', 'tv').every((t) => t.mediaType === 'tv')).toBe(true);
    expect(searchTitles(db().titles, '   ', 'all')).toEqual([]);
  });
});

describe('parseCsv', () => {
  it('handles quotes, commas and CRLF', () => {
    expect(parseCsv('title,year\r\n"Hello, World",2024\n"Say ""hi""",2025\n')).toEqual([
      ['title', 'year'],
      ['Hello, World', '2024'],
      ['Say "hi"', '2025'],
    ]);
  });
});
