import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ImportRowItem } from '@/components/import/ImportRowItem';
import { ImportSection } from '@/components/settings/ImportSection';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { LogWatchButton } from '@/components/ui/LogWatchButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useToast } from '@/components/ui/Toast';
import { plural } from '@/lib/format';
import { useConfirmImport, useImportRows } from '@/queries/import';
import { errorMessage } from '@/services';

export default function ImportPage() {
  const { data: rows } = useImportRows();
  const confirm = useConfirmImport();
  const toast = useToast();
  const navigate = useNavigate();
  const matched = rows?.filter((r) => r.status === 'matched').length ?? 0;
  const review = rows?.filter((r) => r.status === 'needs_review' || r.status === 'manual').length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        as="h1"
        title="Import past watches"
        sub="REVIEW"
        right={<ArrowLink to="/settings">Back to Settings</ArrowLink>}
      />
      {!rows ? (
        <EmptyState message="no file yet. pick a CSV to start." action={<ImportSection />} />
      ) : (
        <>
          <p className="text-[13px]">
            <strong>{matched} matched</strong> · {review} need a look ·{' '}
            {rows.filter((r) => r.status === 'skipped').length} skipped
            {rows.some((r) => r.status === 'imported') &&
              ` · ${rows.filter((r) => r.status === 'imported').length} already imported`}
          </p>
          <ul className="flex flex-col">
            {rows.map((r) => (
              <ImportRowItem key={r.id} row={r} />
            ))}
          </ul>
          <p className="text-[12px] text-muted">
            Imported titles get the year only, so they show in lists, stats and Top 5 but not on the calendar.
          </p>
          <LogWatchButton
            icon="▶"
            className="self-start"
            disabled={!matched || confirm.isPending}
            onClick={() =>
              confirm.mutate(undefined, {
                onSuccess: ({ imported, skipped }) => {
                  toast.show(`Imported ${plural(imported, 'title')}${skipped ? `, skipped ${skipped}` : ''}`);
                  navigate('/watched');
                },
                onError: (e) => toast.show(errorMessage(e), 'error'),
              })
            }
          >
            Import {plural(matched, 'title')}
          </LogWatchButton>
        </>
      )}
    </div>
  );
}
