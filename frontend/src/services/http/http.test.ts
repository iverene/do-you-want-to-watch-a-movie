import { ApiError } from '../errors';
import { httpServices as api } from './index';

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(body === null ? null : JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('http services', () => {
  it('maps each method to its endpoint with credentials', async () => {
    const fn = mockFetch(200, { items: [], total: 0 });
    await api.screenings.list({ scope: 'ours', year: 2026, type: 'all' });
    expect(fn).toHaveBeenCalledWith(
      '/api/screenings?scope=ours&year=2026&type=all',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('sends JSON bodies', async () => {
    const fn = mockFetch(204, null);
    await api.watchlist.remove('w-1');
    await api.me.changePassword({ currentPassword: 'a', newPassword: 'b' });
    const [url, init] = fn.mock.calls[1] as unknown as [string, RequestInit];
    expect(url).toBe('/api/me/password');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({ currentPassword: 'a', newPassword: 'b' });
  });

  it('turns the error body into an ApiError with fields', async () => {
    mockFetch(422, {
      error: { code: 'VALIDATION', message: 'Check the form.', fields: { title: 'Add a title.' } },
    });
    const err = await api.screenings.create({ titleId: 'x' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ code: 'VALIDATION', status: 422, fields: { title: 'Add a title.' } });
  });

  it('rejects responses that do not match the contract in development', async () => {
    mockFetch(200, { user: { id: 1 } });
    await expect(api.auth.me()).rejects.toBeInstanceOf(ApiError);
  });
});
