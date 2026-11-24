import { useState } from 'react';
import { shiftDays, todayIn } from '@/lib/dates';
import { usePlanNight } from '@/queries/movieNights';
import { errorMessage, isApiError, type WatchlistItem } from '@/services';
import { useToast } from '../ui/Toast';

/** ✎ Plan a movie night: pick a date; the other person accepts or declines. */
export function PlanNight({ item, onDone }: { item: WatchlistItem; onDone: () => void }) {
  const [date, setDate] = useState(shiftDays(todayIn(), 1));
  const [error, setError] = useState<string | null>(null);
  const plan = usePlanNight();
  const toast = useToast();
  return (
    <form
      className="flex flex-col gap-1.5 border border-dashed border-dot p-2"
      onSubmit={(e) => {
        e.preventDefault();
        plan.mutate(
          { titleId: item.title.id, date },
          {
            onSuccess: () => {
              toast.show(`Movie night proposed: ${item.title.title}`);
              onDone();
            },
            onError: (err) =>
              setError(isApiError(err) && err.fields?.date ? err.fields.date : errorMessage(err)),
          },
        );
      }}
    >
      <label className="flex flex-col gap-1 text-[12px] font-extrabold">
        Movie night on
        <input
          type="date"
          value={date}
          min={todayIn()}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 border border-control bg-paper px-1 font-normal"
        />
      </label>
      {error && <p className="text-[12px] text-red">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={plan.isPending}
          className="bevel min-h-9 flex-1 rounded text-[12px] font-bold max-lg:min-h-11"
        >
          Propose
        </button>
        <button type="button" onClick={onDone} className="min-h-9 text-[12px] text-link underline">
          cancel
        </button>
      </div>
    </form>
  );
}
