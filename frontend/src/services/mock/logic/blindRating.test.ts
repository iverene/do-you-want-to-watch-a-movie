import type { Rating } from '../../types';
import { visibleRatings } from './blindRating';

const r = (userId: string, stars: Rating['stars']): Rating => ({
  userId,
  stars,
  comment: null,
  updatedAt: '',
});

describe('visibleRatings (blind rating, S2)', () => {
  it('hides the partner rating until the viewer rates', () => {
    const v = visibleRatings([r('sam', 4)], 'alex');
    expect(v.ratings).toEqual([]);
    expect(v.hidden).toBe(true);
    expect(v.averageStars).toBeNull();
  });

  it('shows both once the viewer has rated, and averages them', () => {
    const v = visibleRatings([r('sam', 4), r('alex', 5)], 'alex');
    expect(v.ratings).toHaveLength(2);
    expect(v.hidden).toBe(false);
    expect(v.averageStars).toBe(4.5);
  });

  it('is not hidden when nobody rated', () => {
    expect(visibleRatings([], 'alex').hidden).toBe(false);
  });
});
