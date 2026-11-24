import { useState } from 'react';
import { useUpdateImportRow } from '@/queries/import';
import { titleMeta } from '@/lib/format';
import { errorMessage, type ImportRow } from '@/services';
import { Poster } from '../media/Poster';
import { Tag } from '../ui/Tag';
import { useToast } from '../ui/Toast';
import { ChangeMatch } from './ChangeMatch';
import { ImportManualDialog } from './ImportManualDialog';

const STATUS: Record<ImportRow['status'], string> = {
  matched: 'MATCHED',
  needs_review: 'NEEDS A LOOK',
  manual: 'MANUAL',
  skipped: 'SKIPPED',
  imported: 'ALREADY IMPORTED',
};

export function ImportRowItem({ row }: { row: ImportRow }) {
  const update = useUpdateImportRow();
  const toast = useToast();
  const [changing, setChanging] = useState(false);
  const [manual, setManual] = useState(false);
  const patch = (body: Parameters<typeof update.mutate>[0]['body'], after?: () => void) =>
    update.mutate(
      { id: row.id, body },
      { onSuccess: after, onError: (e) => toast.show(errorMessage(e), 'error') },
    );
  const done = row.status === 'imported';

  return (
    <li className="flex flex-col gap-2 border-b border-dashed border-dot py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full min-w-0 sm:w-[200px]">
          <p className="truncate font-pixel text-[15px]">{row.rawTitle}</p>
          <p className="text-[12px] text-muted">from the CSV · watched {row.watchedYear}</p>
        </div>
        <span aria-hidden className="text-orange">
          ▶
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {row.match ? (
            <>
              <Poster
                title={row.match.title}
                posterUrl={row.match.posterUrl}
                tintKey={row.match.id}
                className="w-9"
                decorative
              />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold">{row.match.title}</span>
                <span className="block text-[12px] text-muted">{titleMeta(row.match, { genre: false })}</span>
              </span>
            </>
          ) : (
            <span className="text-[13px] text-muted">No match</span>
          )}
        </div>
        <Tag variant={row.status === 'matched' ? 'new' : row.status === 'needs_review' ? 'note' : 'plain'}>
          {STATUS[row.status]}
        </Tag>
      </div>
      {!done && (
        <div className="flex flex-wrap gap-3 text-[13px]">
          {row.status === 'needs_review' && row.match && (
            <button
              type="button"
              className="min-h-9 font-bold text-link underline"
              onClick={() => patch({ matchTitleId: row.match!.id })}
            >
              Use this match
            </button>
          )}
          <button
            type="button"
            aria-expanded={changing}
            className="min-h-9 text-link underline"
            onClick={() => setChanging((c) => !c)}
          >
            Change match
          </button>
          <button type="button" className="min-h-9 text-link underline" onClick={() => setManual(true)}>
            Add manually
          </button>
          {row.status !== 'skipped' && (
            <button
              type="button"
              className="min-h-9 text-link underline"
              onClick={() => patch({ status: 'skipped' })}
            >
              Skip
            </button>
          )}
        </div>
      )}
      {changing && (
        <ChangeMatch
          row={row}
          busy={update.isPending}
          onPick={(t) => patch({ matchTitleId: t.id }, () => setChanging(false))}
        />
      )}
      {manual && (
        <ImportManualDialog
          row={row}
          onClose={() => setManual(false)}
          onDone={(t) => patch({ matchTitleId: t.id }, () => setManual(false))}
        />
      )}
    </li>
  );
}
