import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { Stars } from '@/services';
import { StarInput } from './StarInput';

function Harness({ start = null }: { start?: Stars | null }) {
  const [v, setV] = useState<Stars | null>(start);
  return <StarInput label="Your rating" value={v} onChange={setV} />;
}

describe('StarInput', () => {
  it('is a radiogroup with one tab stop', async () => {
    render(<Harness start={3} />);
    const radios = screen.getAllByRole('radio');
    expect(screen.getByRole('radiogroup', { name: 'Your rating' })).toBeInTheDocument();
    expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('3 stars · liked it')).toBeInTheDocument();
  });

  it('changes with arrow keys, number keys and clicks, staying within 1..5', async () => {
    const user = userEvent.setup();
    render(<Harness start={4} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: /4 stars/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('radio', { name: /5 stars/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /5 stars/ })).toHaveFocus();
    await user.keyboard('2');
    expect(screen.getByText('2 stars · it was ok')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('radio', { name: /1 star/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('radio', { name: /5 stars/ }));
    expect(screen.getByText('5 stars · loved it')).toBeInTheDocument();
  });
});
