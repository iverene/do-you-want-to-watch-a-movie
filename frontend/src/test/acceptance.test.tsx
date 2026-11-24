import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp';

describe('acceptance', () => {
  it('a new shared watch shows up in Home, Watched, Calendar, Stats and the streak', async () => {
    const user = userEvent.setup();
    renderApp('/');
    expect(await screen.findByText('6-week streak')).toBeInTheDocument();
    await user.keyboard('n');
    const dialog = await screen.findByRole('dialog', { name: 'Log a watch' });
    await user.type(within(dialog).getByLabelText('Search movies and series'), 'starlit');
    await user.click(await within(dialog).findByRole('button', { name: 'Select Starlit Diner' }));
    await user.click(within(dialog).getByRole('button', { name: /Save & rate/ }));
    await user.click(await screen.findByRole('button', { name: 'Skip for now' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(await screen.findByText('7-week streak')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Today 1, total 31$/)).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Recently watched' })).getByText('Starlit Diner'),
    ).toBeInTheDocument();

    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Watched' }),
    );
    expect(await screen.findByText('Starlit Diner')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Calendar' }));
    expect(await screen.findByRole('button', { name: /Nov 24, 2026: Starlit Diner/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stats' }));
    const total = (await screen.findByText('Total watched')).parentElement!;
    await waitFor(() => expect(total).toHaveTextContent(/^Total watched19/)); // was 18
  });

  it('blind rating holds when switching users through sign out and sign in', async () => {
    const user = userEvent.setup();
    renderApp('/settings', { as: 'u-sam' });
    await user.click(await screen.findByRole('button', { name: 'Sign out' }));
    await user.type(await screen.findByLabelText('Username'), 'alex');
    await user.type(screen.getByLabelText('Password'), 'movienight2026');
    await user.click(screen.getByRole('button', { name: /Come in/ }));
    await screen.findByText('TOP PICK');

    // Sam rated Night Bus 42 (Nov 22); Alex hasn't, so Sam's stars are hidden.
    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Watched' }),
    );
    await user.click(await screen.findByRole('link', { name: /Night Bus 42/ }));
    expect(await screen.findByText("Sam's stars stay hidden until you rate.")).toBeInTheDocument();
    expect(screen.queryByText('stop 42 forever.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rate it' }));
    const dialog = await screen.findByRole('dialog', { name: 'Rate it' });
    await user.click(within(dialog).getByRole('radio', { name: /3 stars/ }));
    await user.click(within(dialog).getByRole('button', { name: /Save rating/ }));
    expect(await screen.findByText('stop 42 forever.')).toBeInTheDocument();
    expect(screen.getByText('average of you two')).toBeInTheDocument();
  });

  it('wrong passwords show the message, and five tries lock sign-in', async () => {
    const user = userEvent.setup();
    renderApp('/login', { as: null });
    const pw = await screen.findByLabelText('Password');
    await user.type(screen.getByLabelText('Username'), 'alex');
    for (let i = 0; i < 5; i++) {
      await user.clear(pw);
      await user.type(pw, `wrong${i}{Enter}`);
      await screen.findByRole('alert');
    }
    expect(await screen.findByText('Too many tries. Wait 15 minutes.')).toBeInTheDocument();
  });
});
