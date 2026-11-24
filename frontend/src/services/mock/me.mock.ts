import type { MeService } from '../contracts';
import { ApiError } from '../errors';
import { save } from './db';
import { toScreening } from './logic/view';
import { handle, publicUser, requireUser } from './util';

export const meMock: MeService = {
  update: (body) =>
    handle(() => {
      const { me } = requireUser();
      if (body.displayName !== undefined) {
        const name = body.displayName.trim();
        if (name.length < 1 || name.length > 30) {
          throw new ApiError('VALIDATION', 'Check your name.', { displayName: 'Use 1 to 30 characters.' });
        }
        me.displayName = name;
      }
      if (body.theme !== undefined) me.theme = body.theme;
      save();
      return { user: publicUser(me) };
    }),

  setAvatar: (avatar) =>
    handle(() => {
      const { me } = requireUser();
      me.avatar = { ...avatar };
      save();
      return { user: publicUser(me) };
    }),

  setGenres: ({ genreIds }) =>
    handle(() => {
      const { d, me } = requireUser();
      const unknown = genreIds.filter((g) => !d.genres.some((x) => x.id === g));
      if (unknown.length)
        throw new ApiError('VALIDATION', 'Unknown genre.', { genreIds: 'Pick from the list.' });
      me.favoriteGenreIds = [...new Set(genreIds)];
      save();
      return { user: publicUser(me) };
    }),

  /** PUT /me/top-five — only titles this user has watched (422 otherwise). */
  setTopFive: ({ screeningIds }) =>
    handle(() => {
      const { d, me } = requireUser();
      if (screeningIds.length !== 5) {
        throw new ApiError('VALIDATION', 'Top 5 needs five slots.', {
          screeningIds: 'Send exactly 5 slots.',
        });
      }
      const fields: Record<string, string> = {};
      screeningIds.forEach((id, i) => {
        if (id === null) return;
        const s = d.screenings.find((x) => x.id === id);
        if (!s || !s.viewerIds.includes(me.id)) fields[`screeningIds.${i}`] = 'Only titles you have watched.';
      });
      if (Object.keys(fields).length)
        throw new ApiError('VALIDATION', 'Only titles you have watched.', fields);
      me.topFive = [...screeningIds];
      save();
      return {
        topFive: me.topFive.map((id) => {
          const s = id ? d.screenings.find((x) => x.id === id) : undefined;
          return s ? toScreening(d, s, me.id) : null;
        }),
      };
    }),

  changePassword: ({ currentPassword, newPassword }) =>
    handle(() => {
      const { me } = requireUser();
      if (currentPassword !== me.password) {
        throw new ApiError('VALIDATION', 'Check your current password.', {
          currentPassword: "That's not your current password.",
        });
      }
      if (newPassword.length < 10) {
        throw new ApiError('VALIDATION', 'Password too short.', {
          newPassword: 'Use at least 10 characters.',
        });
      }
      me.password = newPassword;
      save();
    }),
};
