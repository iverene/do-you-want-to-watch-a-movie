import { tasteMatch } from './tasteMatch';

describe('tasteMatch', () => {
  it('is null when nothing was rated by both', () => {
    expect(tasteMatch([])).toBeNull();
  });

  it('is the share of titles whose ratings differ by at most one star', () => {
    expect(
      tasteMatch([
        { titleId: 'a', a: 5, b: 4 },
        { titleId: 'b', a: 5, b: 2 },
        { titleId: 'c', a: 3, b: 3 },
        { titleId: 'd', a: 1, b: 3 },
      ]),
    ).toBe(50);
  });

  it('counts a rewatched title once, using the latest pair', () => {
    expect(
      tasteMatch([
        { titleId: 'a', a: 5, b: 1 },
        { titleId: 'a', a: 5, b: 5 },
      ]),
    ).toBe(100);
  });
});
