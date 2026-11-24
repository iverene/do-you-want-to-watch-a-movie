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
});
