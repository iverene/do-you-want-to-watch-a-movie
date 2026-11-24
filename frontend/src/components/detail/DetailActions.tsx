import { useState } from 'react';
import { useLogWatch } from '@/app/LogWatchContext';
import { todayIn } from '@/lib/dates';
import { useSession } from '@/queries/auth';
import { useCreateScreening, useUpdateScreening } from '@/queries/screenings';
import { errorMessage, isApiError, type Screening } from '@/services';
import { BevelButton } from '../ui/BevelButton';
import { useToast } from '../ui/Toast';

/** Log a rewatch, Edit my rating, Change date. */
export function DetailActions({ s }: { s: Screening }) {
  const { user } = useSession();
  const { open } = useLogWatch();
  const toast = useToast();
  const rewatch = useCreateScreening();
  const update = useUpdateScreening();
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState(s.watchedOn ?? todayIn());
  const [dateError, setDateError] = useState<string | null>(null);
  const mine = s.viewerIds.includes(user.id);
  const rated = s.ratings.some((r) => r.userId === user.id);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <BevelButton
          dense
          disabled={rewatch.isPending}
          onClick={() =>
            rewatch.mutate(
              { titleId: s.title.id },
              {
                onSuccess: ({ screening }) => open({ mode: 'rate', screening, justSaved: true }),
                onError: (e) => toast.show(errorMessage(e), 'error'),
              },
            )
          }
        >
          Log a rewatch
        </BevelButton>
        {mine && (
          <BevelButton dense onClick={() => open({ mode: 'rate', screening: s })}>
            {rated ? 'Edit my rating' : 'Rate it'}
          </BevelButton>
        )}
        <BevelButton dense aria-expanded={dateOpen} onClick={() => setDateOpen((o) => !o)}>
          Change date
        </BevelButton>
      </div>
      {dateOpen && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate(
              { id: s.id, body: { watchedOn: date } },
              {
                onSuccess: () => {
                  setDateOpen(false);
                  toast.show('Date changed');
                },
                onError: (err) =>
                  setDateError(
                    isApiError(err) && err.fields?.watchedOn ? err.fields.watchedOn : errorMessage(err),
                  ),
              },
            );
          }}
        >
          <label className="flex flex-col gap-1 text-[13px] font-extrabold">
            Watched on
            <input
              type="date"
              value={date}
              max={todayIn()}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 border border-control bg-paper px-2 font-normal"
            />
          </label>
          <BevelButton type="submit" dense disabled={update.isPending}>
            Save date
          </BevelButton>
          {dateError && <p className="w-full text-[12px] text-red">{dateError}</p>}
        </form>
      )}
    </div>
  );
}
