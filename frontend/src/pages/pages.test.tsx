import { screen, waitFor } from '@testing-library/react';
import { renderApp } from '@/test/renderApp';

describe('app pages on mock data', () => {
  it('sends signed-out visitors to the login page', async () => {
    renderApp('/watched', { as: null });
    expect(await screen.findByRole('heading', { name: 'Do You Want to Watch a Movie?' })).toBeInTheDocument();
  });

  it('renders Home inside the binder', async () => {
    renderApp('/');
    expect(await screen.findByText(/Alex & Sam's movie room/)).toBeInTheDocument();
    expect(await screen.findByText('TOP PICK')).toBeInTheDocument();
    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(await screen.findByText('Recently watched')).toBeInTheDocument();
    expect(await screen.findByText('6-week streak')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '6 of the last 8 weeks had a shared watch' })).toBeInTheDocument();
  });

  it('lists watched titles by month with imports after the dated ones', async () => {
    renderApp('/watched?scope=ours');
    expect(await screen.findByRole('heading', { name: /November 2026/ })).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '');
    expect(headings.findIndex((h) => h.includes('August 2026'))).toBeLessThan(
      headings.findIndex((h) => h.includes('watched in 2025')),
    );
    expect(screen.getAllByText('Rate it').length).toBeGreaterThan(0);
  });

  it('shows the calendar with a stacked day and the undated note', async () => {
    renderApp('/watched/calendar?scope=ours&month=2026-10');
    expect(await screen.findByRole('button', { name: /Oct 31, 2026: .+, .+/ })).toHaveTextContent('2');
    expect(screen.getByText('2026 . 10')).toBeInTheDocument();
    expect(screen.queryByText(/aren.t on the calendar/)).not.toBeInTheDocument();
  });

  it('shows stats with the four big numbers', async () => {
    renderApp('/watched/stats?scope=ours&year=2026');
    expect(await screen.findByText('Total watched')).toBeInTheDocument();
    const { within } = await import('@testing-library/react');
    expect(within(screen.getByRole('main')).getAllByText('18')).toHaveLength(2); // total and together
    expect(screen.getByText(/best streak 9 weeks/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Titles per month in 2026/ })).toBeInTheDocument();
  });

  it('hides the partner rating on title detail until you rate (blind rating)', async () => {
    renderApp('/watched/s-24', { as: 'u-alex' });
    expect(await screen.findByRole('heading', { name: 'Night Bus 42' })).toBeInTheDocument();
    expect(screen.getByText("Sam's stars stay hidden until you rate.")).toBeInTheDocument();
    expect(screen.getByText('No.30 (2026.11.22)')).toBeInTheDocument();
  });

  it('shows both bubbles once both have rated, plus the rewatch history', async () => {
    renderApp('/watched/s-19', { as: 'u-sam' });
    expect(await screen.findByRole('heading', { name: 'Paper Moons' })).toBeInTheDocument();
    expect(screen.getByText('told you.')).toBeInTheDocument();
    expect(screen.getByText('still perfect.')).toBeInTheDocument();
    expect(screen.getByText(/also Aug 7, 2026 [(]first watch[)]/)).toBeInTheDocument();
  });
});

describe('watchlist', () => {
  it('marks a title watched: the card goes and the rate step opens', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const { within } = await import('@testing-library/react');
    const user = userEvent.setup();
    renderApp('/watchlist');
    const card = await screen.findByRole('article', { name: 'Signal from Vega' });
    expect(screen.getByText('10 TITLES TO WATCH')).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: '✓ Watched' }));
    expect(await screen.findByText(/SAVED Signal from Vega is in Watched/)).toBeInTheDocument();
    expect(await screen.findByText('9 TITLES TO WATCH')).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'Signal from Vega' })).not.toBeInTheDocument();
  });
});

describe('profile', () => {
  it("shows the partner's profile read-only with their Top 5", async () => {
    renderApp('/profile/sam');
    expect(await screen.findByRole('heading', { name: 'Sam', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/@sam · \d+ watched · taste match with Alex \d+%/)).toBeInTheDocument();
    expect(screen.getByText('Number 5: empty')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByText(/badge/i)).not.toBeInTheDocument();
  });

  it('edits my Top 5 with only watched titles', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const { within } = await import('@testing-library/react');
    const user = userEvent.setup();
    renderApp('/profile/alex');
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    const dialog = await screen.findByRole('dialog', { name: 'Top 5' });
    const slot5 = await within(dialog).findByRole('combobox', { name: 'Number 5' });
    await user.type(slot5, 'signal');
    expect(within(dialog).getByText('No watched title matches.')).toBeInTheDocument(); // on the watchlist, not watched
    await user.clear(slot5);
    await user.type(slot5, 'night bus');
    await user.click(within(dialog).getByRole('option', { name: /Night Bus 42/ }));
    expect(slot5).toHaveValue('Night Bus 42 (2023)');
    await user.click(within(dialog).getByRole('button', { name: /Save Top 5/ }));
    expect(await screen.findByText(/Top 5 saved/)).toBeInTheDocument();
  });
});

describe('settings', () => {
  it('switches to dark, saves it per user, and validates the password form', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const { db } = await import('@/services/mock/db');
    const user = userEvent.setup();
    renderApp('/settings');
    await user.click(await screen.findByRole('radio', { name: '☾ Dark' }));
    expect(document.documentElement).toHaveClass('theme-dark');
    expect(localStorage.getItem('dywwam-theme')).toBe('dark');
    await vi.waitFor(() => expect(db().users[0].theme).toBe('dark'));

    await user.type(screen.getByLabelText('Current password'), 'movienight2026');
    await user.type(screen.getByLabelText(/^New password/), 'short');
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText('Use at least 10 characters.')).toBeInTheDocument();
    expect(screen.getByText('Reset demo data')).toBeInTheDocument();
    document.documentElement.className = 'theme-light';
  });
});

describe('import', () => {
  it('uploads a CSV, reviews matches and imports', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const { db } = await import('@/services/mock/db');
    const user = userEvent.setup();
    const { container } = renderApp('/settings');
    await screen.findByRole('button', { name: 'Choose CSV file' });
    const file = new File(
      ['title,year\nOrbit of Two,2025\nLemon Tree,2024\nNo Such Film,2023\n'],
      'past.csv',
      { type: 'text/csv' },
    );
    await user.upload(
      container.ownerDocument.querySelector('input[type=file][accept=".csv,text/csv"]') as HTMLInputElement,
      file,
    );
    expect(await screen.findByText(/1 matched/)).toBeInTheDocument();
    expect(screen.getByText('No match')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use this match' }));
    expect(await screen.findByText(/2 matched/)).toBeInTheDocument();
    const before = db().screenings.length;
    await user.click(screen.getByRole('button', { name: /Import 2 titles/ }));
    expect(await screen.findByText(/Imported 2 titles, skipped 1/)).toBeInTheDocument();
    expect(db().screenings.length).toBe(before + 2);
  });
});

describe('mobile layout', () => {
  it('puts tabs along the top, the streak on Home, and no left page or bottom bar', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...original(q), matches: false })) as typeof window.matchMedia;
    try {
      renderApp('/');
      const nav = await screen.findByRole('navigation', { name: 'Main' });
      const { within } = await import('@testing-library/react');
      expect(
        within(nav)
          .getAllByRole('link')
          .map((l) => l.textContent),
      ).toEqual(['Home', 'Watched', 'Watchlist', 'Profile']);
      expect(await screen.findByText('6-week streak')).toBeInTheDocument();
      expect(screen.queryByRole('complementary', { name: 'Our room' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Log a watch/ })).toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('revisions', () => {
  it('asks before removing a watchlist title, and the header button adds to the watchlist', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const { within } = await import('@testing-library/react');
    const user = userEvent.setup();
    renderApp('/watchlist');
    expect(await screen.findByRole('button', { name: /Add to watchlist/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Log a watch/ })).not.toBeInTheDocument();
    const card = await screen.findByRole('article', { name: 'Signal from Vega' });
    expect(within(card).queryByRole('button', { name: 'want' })).not.toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: /Remove Signal from Vega/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Remove from watchlist' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('article', { name: 'Signal from Vega' })).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: /Remove Signal from Vega/ }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Remove/ }));
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'Signal from Vega' })).not.toBeInTheDocument(),
    );
  });

  it('shows Home rows as posters only, with a custom genre dropdown and a Because-you-watched row', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Home', level: 1 })).toBeInTheDocument();
    expect(await screen.findByRole('list', { name: /^Because you watched / })).toBeInTheDocument();
    expect(await screen.findByRole('list', { name: 'New releases' })).toBeInTheDocument();
    expect(screen.queryByText(/streaming on/)).not.toBeInTheDocument();
    const genre = screen.getByRole('button', { name: /Genre/ });
    genre.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('h{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(genre).toHaveTextContent('Horror');
    // Posters open a preview instead of showing text under them.
    const trending = await screen.findByRole('list', { name: 'Trending' });
    const { within } = await import('@testing-library/react');
    await user.click(within(trending).getAllByRole('button')[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('hearts a title on its page and saves the like', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderApp('/watched/s-19');
    await user.click(await screen.findByRole('button', { name: 'Like' }));
    expect(await screen.findByRole('button', { name: 'Unlike' })).toBeInTheDocument();
    const { db } = await import('@/services/mock/db');
    await waitFor(() =>
      expect(db().likes.some((l) => l.userId === 'u-alex' && l.titleId === 't-01')).toBe(true),
    );
  });
});
