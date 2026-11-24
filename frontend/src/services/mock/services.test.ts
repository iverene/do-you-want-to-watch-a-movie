import { serviceConfig } from '../config';
import { isApiError } from '../errors';
import { seed } from './db';
import { mockServices as api } from './index';

afterAll(() => vi.useRealTimers());
beforeAll(() => {
  serviceConfig.mockLatencyMs = 0;
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-24T12:00:00+08:00'));
});
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  seed();
});

const login = (username: string) => api.auth.login({ username, password: 'movienight2026', remember: false });

describe('mock services', () => {
  it('requires a session', async () => {
    await expect(api.home.get()).rejects.toSatisfy((e) => isApiError(e, 'UNAUTHORIZED'));
  });

  it('rate-limits after 5 failed tries', async () => {
    for (let i = 0; i < 4; i++) {
      await expect(api.auth.login({ username: 'alex', password: 'x', remember: false })).rejects.toSatisfy(
        (e) => isApiError(e, 'UNAUTHORIZED'),
      );
    }
    await expect(api.auth.login({ username: 'alex', password: 'x', remember: false })).rejects.toSatisfy(
      (e) => isApiError(e, 'RATE_LIMITED'),
    );
  });

  it('applies blind rating across users', async () => {
    await login('alex');
    const { screening } = await api.screenings.create({ titleId: 't-19' });
    await api.screenings.rate(screening.id, { stars: 5, comment: 'wow' });
    await api.auth.logout();

    await login('sam');
    let seen = (await api.screenings.get(screening.id)).screening;
    expect(seen.hiddenPartnerRating).toBe(true);
    expect(seen.ratings).toEqual([]);
    seen = (await api.screenings.rate(screening.id, { stars: 3 })).screening;
    expect(seen.hiddenPartnerRating).toBe(false);
    expect(seen.ratings).toHaveLength(2);
    expect(seen.averageStars).toBe(4);
  });

  it('logs a watch from the watchlist and removes the card', async () => {
    await login('sam');
    const before = await api.watchlist.list({});
    const { screening } = await api.watchlist.markWatched(before.items[0].id, {});
    expect(screening.viewerIds).toHaveLength(2);
    const after = await api.watchlist.list({});
    expect(after.total).toBe(before.total - 1);
  });

  it('rejects a Top 5 with unwatched titles (422)', async () => {
    await login('alex');
    const solo = (await api.screenings.list({ scope: 'sam' })).items.find((s) => s.viewerIds.length === 1)!;
    await expect(api.me.setTopFive({ screeningIds: [solo.id, null, null, null, null] })).rejects.toSatisfy(
      (e) => isApiError(e, 'VALIDATION'),
    );
  });

  it('returns 409 when a title is already on the watchlist', async () => {
    await login('alex');
    const { items } = await api.watchlist.list({});
    await expect(api.watchlist.add({ titleId: items[0].title.id })).rejects.toSatisfy((e) =>
      isApiError(e, 'CONFLICT'),
    );
  });

  it('imports a CSV and skips titles already imported', async () => {
    await login('alex');
    const file = new File(['title,year,stars_a\nSignal from Vega,2024,4\nNot A Real Film,2023,\n'], 'w.csv');
    const { rows } = await api.import.upload(file);
    expect(rows[0].status).toBe('matched');
    expect(rows[1].match).toBeNull();
    expect(await api.import.confirm()).toEqual({ imported: 1, skipped: 1 });
    const again = await api.import.upload(file);
    expect(again.rows[0].status).toBe('imported');
  });
});
