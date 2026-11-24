import type { RecommendationsService } from '../contracts';
import { save } from './db';
import { buildRecommendations } from './logic/recommendations';
import { handle, requireUser } from './util';

export const recommendationsMock: RecommendationsService = {
  get: (q) =>
    handle(() => {
      const { d, me } = requireUser();
      return buildRecommendations(d, q.for === 'me' ? me.id : null, q.type, d.recRotation);
    }),

  refresh: (body) =>
    handle(() => {
      const { d, me } = requireUser();
      d.recRotation += 1;
      save();
      return buildRecommendations(d, body.for === 'me' ? me.id : null, 'all', d.recRotation);
    }),
};
