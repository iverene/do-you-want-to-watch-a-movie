import type { ProjectionistService } from '../contracts';
import { ApiError } from '../errors';
import { buildRecommendations } from './logic/recommendations';
import { handle, requireUser } from './util';

/** A tiny keyword "AI": genre words and "short"/"under 2 hours" narrow the shared picks. */
export const projectionistMock: ProjectionistService = {
  ask: ({ message }) =>
    handle(() => {
      const { d } = requireUser();
      const text = message.trim().toLowerCase();
      if (!text) throw new ApiError('VALIDATION', 'Ask me something.', { message: 'Type a request.' });
      const { top, items } = buildRecommendations(d, null, text.includes('series') ? 'tv' : 'all', 0, 40);
      let picks = [top, ...items].filter((r): r is NonNullable<typeof r> => r !== null);
      const genre = d.genres.find((g) => text.includes(g.name.toLowerCase()));
      if (genre) picks = picks.filter((p) => p.title.genres.some((g) => g.id === genre.id));
      if (/short|under 2|quick/.test(text))
        picks = picks.filter((p) => (p.title.runtimeMinutes ?? 999) < 120);
      picks = picks.slice(0, 3);
      const reply = picks.length
        ? `Here ${picks.length === 1 ? 'is one pick' : `are ${picks.length} picks`} from the booth.`
        : 'Nothing in the reels matches that. Try another mood?';
      return { reply, picks };
    }),
};
