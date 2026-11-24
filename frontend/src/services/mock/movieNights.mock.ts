import type { MovieNightsService } from '../contracts';
import { ApiError } from '../errors';
import type { MovieNight } from '../types';
import { nowIso, save, uid, type Db, type DbNight } from './db';
import { titleById } from './logic/view';
import { assertDate, handle, requireUser, today } from './util';

const view = (d: Db, n: DbNight): MovieNight => ({
  id: n.id,
  title: titleById(d, n.titleId),
  proposedBy: n.proposedBy,
  date: n.date,
  status: n.status,
  createdAt: n.createdAt,
});

export const movieNightsMock: MovieNightsService = {
  list: () =>
    handle(() => {
      const { d } = requireUser();
      return { items: [...d.nights].sort((a, b) => a.date.localeCompare(b.date)).map((n) => view(d, n)) };
    }),

  create: ({ titleId, date }) =>
    handle(() => {
      const { d, me } = requireUser();
      assertDate(date, 'date');
      if (date < today())
        throw new ApiError('VALIDATION', 'Pick a day from today on.', { date: 'That day has passed.' });
      titleById(d, titleId);
      const night: DbNight = {
        id: uid('n'),
        titleId,
        proposedBy: me.id,
        date,
        status: 'proposed',
        createdAt: nowIso(),
      };
      d.nights.push(night);
      save();
      return { night: view(d, night) };
    }),

  update: (id, { status }) =>
    handle(() => {
      const { d, me } = requireUser();
      const night = d.nights.find((n) => n.id === id);
      if (!night) throw new ApiError('NOT_FOUND', 'That movie night is gone.');
      if (night.proposedBy === me.id) throw new ApiError('FORBIDDEN', 'The other person answers this one.');
      night.status = status;
      save();
      return { night: view(d, night) };
    }),
};
