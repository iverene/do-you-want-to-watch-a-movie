import { screen } from '@testing-library/react';
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
    expect(screen.getAllByText('18')).toHaveLength(2); // total and together
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
