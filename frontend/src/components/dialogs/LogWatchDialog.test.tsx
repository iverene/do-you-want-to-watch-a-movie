import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/renderApp';
import { db } from '@/services/mock/db';

describe('Log a watch', () => {
  it('searches, saves and rates with the keyboard', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await screen.findByText('TOP PICK');

    await user.keyboard('n');
    const dialog = await screen.findByRole('dialog', { name: 'Log a watch' });
    const search = within(dialog).getByLabelText('Search movies and series');
    expect(search).toHaveFocus();

    await user.type(search, 'signal');
    await user.click(await within(dialog).findByRole('button', { name: 'Select Signal from Vega' }));
    expect(within(dialog).getByText('✓ SELECTED')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /Save & rate/ }));

    const rate = await screen.findByRole('dialog', { name: 'Log a watch' });
    expect(await within(rate).findByText(/SAVED Signal from Vega is in Watched/)).toBeInTheDocument();
    const stars = within(rate).getByRole('radiogroup', { name: 'Your rating, Alex' });
    within(stars).getAllByRole('radio')[0].focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(within(stars).getByRole('radio', { name: /4 stars/ })).toHaveAttribute('aria-checked', 'true');
    await user.type(within(rate).getByLabelText(/Comment/), 'so good');
    await user.click(within(rate).getByRole('button', { name: /Save rating/ }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const saved = db().screenings.find((s) => s.titleId === 't-19')!;
    expect(saved.viewerIds).toHaveLength(2);
    expect(db().ratings.find((r) => r.screeningId === saved.id)).toMatchObject({
      stars: 4,
      comment: 'so good',
    });
  });

  it('adds a title manually and requires a genre', async () => {
    const user = userEvent.setup();
    renderApp('/?log=1');
    const dialog = await screen.findByRole('dialog', { name: 'Log a watch' });
    await user.click(within(dialog).getByRole('button', { name: 'Add it manually' }));
    await user.type(within(dialog).getByLabelText(/Title/), 'Our Home Video');
    await user.click(within(dialog).getByRole('button', { name: /Save & rate/ }));
    expect(await within(dialog).findByText('Pick at least one genre.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Documentary' }));
    await user.click(within(dialog).getByRole('button', { name: /Save & rate/ }));
    expect(await screen.findByText(/SAVED Our Home Video is in Watched/)).toBeInTheDocument();
    expect(db().titles.find((t) => t.title === 'Our Home Video')).toMatchObject({
      source: 'manual',
      posterUrl: null,
    });
  });

  it('closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const cta = await screen.findByRole('button', { name: /Log a watch/ });
    await user.click(cta);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(cta).toHaveFocus();
  });
});
