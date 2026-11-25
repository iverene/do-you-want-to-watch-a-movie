import { db, resetDb, save, seed } from './db';
import { serviceConfig } from '../config';

describe('mock seed', () => {
  beforeEach(() => {
    localStorage.clear();
    seed();
  });

  it('has the catalog and history the prompt asks for', () => {
    const d = db();
    expect(d.titles.filter((t) => t.mediaType === 'movie')).toHaveLength(46);
    expect(d.titles.filter((t) => t.mediaType === 'tv')).toHaveLength(18);
    expect(d.screenings.filter((s) => s.datePrecision === 'day')).toHaveLength(24);
    expect(d.screenings.filter((s) => s.datePrecision === 'year')).toHaveLength(6);
    expect(d.watchlist).toHaveLength(10);
    expect(d.users.map((u) => u.username)).toEqual(['alex', 'sam']);
    expect(d.titles.every((t) => t.posterUrl === null)).toBe(true);
  });

  it('numbers screenings 1..N in order', () => {
    expect(db().screenings.map((s) => s.number)).toEqual(db().screenings.map((_, i) => i + 1));
  });

  it('persists to localStorage and resets', () => {
    db().note.mood = 'changed';
    save();
    expect(localStorage.getItem(serviceConfig.mockStorageKey)).toContain('changed');
    resetDb();
    expect(db().note.mood).not.toBe('changed');
  });
});
