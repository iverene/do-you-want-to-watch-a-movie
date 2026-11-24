import type { ImportService } from '../contracts';
import { ApiError } from '../errors';
import type { ImportRow, MediaType, Stars } from '../types';
import { nowIso, save, uid, type Db, type DbImportRow } from './db';
import { parseCsv } from './logic/csv';
import { matchImport } from './logic/importMatch';
import { titleById } from './logic/view';
import { handle, readFileText, requireUser } from './util';

const view = (d: Db, r: DbImportRow): ImportRow => ({
  id: r.id,
  rawTitle: r.rawTitle,
  watchedYear: r.watchedYear,
  match: r.matchTitleId ? titleById(d, r.matchTitleId) : null,
  candidates: r.candidateIds.map((id) => titleById(d, id)),
  status: r.status,
});

const toStars = (v: string | undefined): Stars | null => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? (n as Stars) : null;
};

export const importMock: ImportService = {
  /** POST /import — CSV `title,year` + optional `type,who,stars_a,stars_b`. */
  upload: async (file) => {
    const text = await readFileText(file);
    return handle(() => {
      const { d } = requireUser();
      const [header, ...lines] = parseCsv(text);
      const cols = (header ?? []).map((h) => h.toLowerCase());
      const ti = cols.indexOf('title');
      const yi = cols.indexOf('year');
      if (ti < 0 || yi < 0) {
        throw new ApiError('VALIDATION', 'The CSV needs title and year columns.', {
          file: 'Add a "title,year" header row.',
        });
      }
      const [a, b] = d.users;
      const rows: DbImportRow[] = lines.map((cells) => {
        const rawTitle = cells[ti] ?? '';
        const watchedYear = Number(cells[yi]);
        const type = cells[cols.indexOf('type')]?.toLowerCase();
        const mediaType: MediaType | null =
          type === 'movie' ? 'movie' : type === 'series' || type === 'tv' ? 'tv' : null;
        const who = cells[cols.indexOf('who')]?.toLowerCase() || 'both';
        const stars: Record<string, Stars> = {};
        const sa = toStars(cells[cols.indexOf('stars_a')]);
        const sb = toStars(cells[cols.indexOf('stars_b')]);
        if (sa) stars[a.id] = sa;
        if (sb) stars[b.id] = sb;
        const base = { id: uid('ir'), rawTitle, watchedYear, mediaType, who, stars };
        if (!rawTitle || !Number.isInteger(watchedYear)) {
          return { ...base, matchTitleId: null, candidateIds: [], status: 'skipped' as const };
        }
        const pool = d.titles.filter((t) => !mediaType || t.mediaType === mediaType);
        const m = matchImport(pool, rawTitle, watchedYear);
        const already = m.match
          ? d.screenings.some(
              (s) => s.source === 'import' && s.titleId === m.match!.id && s.watchedYear === watchedYear,
            )
          : false;
        return {
          ...base,
          matchTitleId: m.match?.id ?? null,
          candidateIds: m.candidates.map((t) => t.id),
          status: already ? ('imported' as const) : m.status,
        };
      });
      d.importRows = rows;
      save();
      return { rows: rows.map((r) => view(d, r)) };
    });
  },

  updateRow: (id, body) =>
    handle(() => {
      const { d } = requireUser();
      const row = d.importRows.find((r) => r.id === id);
      if (!row) throw new ApiError('NOT_FOUND', 'That row is gone. Upload the file again.');
      if (body.matchTitleId) {
        titleById(d, body.matchTitleId);
        row.matchTitleId = body.matchTitleId;
        if (!row.candidateIds.includes(body.matchTitleId)) row.candidateIds.unshift(body.matchTitleId);
        row.status = 'matched';
      }
      if (body.status) row.status = body.status;
      save();
      return { row: view(d, row) };
    }),

  /** POST /import/confirm — matched rows become year-only screenings; re-runs skip duplicates. */
  confirm: () =>
    handle(() => {
      const { d, me } = requireUser();
      let imported = 0;
      let skipped = 0;
      for (const row of d.importRows) {
        if (row.status !== 'matched' || !row.matchTitleId) {
          if (row.status !== 'imported') skipped += 1;
          continue;
        }
        const titleId = row.matchTitleId;
        const dup = d.screenings.some(
          (s) => s.source === 'import' && s.titleId === titleId && s.watchedYear === row.watchedYear,
        );
        if (dup) {
          row.status = 'imported';
          skipped += 1;
          continue;
        }
        const viewer = d.users.find((u) => u.username === row.who || u.displayName.toLowerCase() === row.who);
        const id = uid('s');
        const at = nowIso();
        d.screenings.push({
          id,
          number: d.screenings.reduce((m, x) => Math.max(m, x.number), 0) + 1,
          titleId,
          watchedOn: null,
          watchedYear: row.watchedYear,
          datePrecision: 'year',
          season: null,
          viewerIds: viewer ? [viewer.id] : d.users.map((u) => u.id),
          source: 'import',
          addedBy: me.id,
          createdAt: at,
        });
        for (const [userId, stars] of Object.entries(row.stars)) {
          d.ratings.push({ screeningId: id, userId, stars, comment: null, updatedAt: at });
        }
        row.status = 'imported';
        imported += 1;
      }
      save();
      return { imported, skipped };
    }),
};
