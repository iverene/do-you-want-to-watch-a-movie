import { computeStreak } from './streak';

describe('computeStreak', () => {
  const today = '2026-11-24'; // Tuesday; this ISO week starts Mon Nov 23

  it('counts consecutive weeks ending last week when this week is empty', () => {
    const s = computeStreak(['2026-11-21', '2026-11-14', '2026-11-03'], today);
    expect(s.current).toBe(3);
    expect(s.lastWeeks).toEqual([false, false, false, false, true, true, true, false]);
  });

  it('includes this week when there is a shared watch in it', () => {
    expect(computeStreak(['2026-11-23', '2026-11-16'], today).current).toBe(2);
  });

  it('breaks after a full week with no shared watch', () => {
    expect(computeStreak(['2026-11-09'], today).current).toBe(0);
  });

  it('treats Sunday as the end of the ISO week', () => {
    // Sun Nov 22 belongs to the week of Nov 16; Mon Nov 16 too.
    expect(computeStreak(['2026-11-22', '2026-11-16'], today).current).toBe(1);
  });

  it('keeps the best run, including a stored best', () => {
    const run = ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24'];
    expect(computeStreak(run, today).best).toBe(4);
    expect(computeStreak(run, today, 9).best).toBe(9);
  });
});
