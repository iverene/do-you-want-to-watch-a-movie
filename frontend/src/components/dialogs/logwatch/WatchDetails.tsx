import { useState } from 'react';
import { formatLong, todayIn } from '@/lib/dates';
import { useSession } from '@/queries/auth';
import type { Title } from '@/services';
import { Dropdown } from '../../ui/Dropdown';
import { Segmented } from '../../ui/Segmented';

export interface WatchDetailsValue {
  watchedOn: string;
  who: 'both' | 'me';
  season: string; // '' = whole series
}

export const initialDetails = (): WatchDetailsValue => ({ watchedOn: todayIn(), who: 'both', season: '' });

/** Right panel: Watched on (today, editable), Who watched, Season (series only). */
export function WatchDetails({
  title,
  value,
  onChange,
  errors,
}: {
  title: Pick<Title, 'mediaType' | 'seasons'> | null;
  value: WatchDetailsValue;
  onChange: (v: WatchDetailsValue) => void;
  errors?: Record<string, string>;
}) {
  const { partner } = useSession();
  const [editingDate, setEditingDate] = useState(false);
  const today = todayIn();
  const seasons = title?.mediaType === 'tv' ? (title.seasons ?? 1) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-extrabold" id="watched-on-label">
          Watched on
        </span>
        {editingDate ? (
          <input
            type="date"
            aria-labelledby="watched-on-label"
            value={value.watchedOn}
            max={today}
            autoFocus
            onChange={(e) => e.target.value && onChange({ ...value, watchedOn: e.target.value })}
            onBlur={() => setEditingDate(false)}
            className="h-11 border border-control bg-paper px-2"
          />
        ) : (
          <p className="flex flex-wrap items-center gap-2 text-[14px]">
            <span>
              {value.watchedOn === today ? 'Today · ' : ''}
              {formatLong(value.watchedOn)}
            </span>
            <button
              type="button"
              className="min-h-6 text-[13px] text-link underline"
              onClick={() => setEditingDate(true)}
            >
              change
            </button>
          </p>
        )}
        {errors?.watchedOn && <p className="text-[12px] text-red">{errors.watchedOn}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-extrabold">Who watched</span>
        <Segmented
          label="Who watched"
          value={value.who}
          onChange={(who) => onChange({ ...value, who })}
          options={[
            { value: 'both', label: 'Both of us' },
            { value: 'me', label: 'Just me' },
          ]}
        />
        <span className="text-[12px] text-muted">
          {value.who === 'both' ? `You and ${partner.displayName}` : 'A solo watch'}
        </span>
      </div>
      {seasons > 0 && (
        <Dropdown
          label="Season"
          hideLabel={false}
          size="lg"
          value={value.season}
          onChange={(season) => onChange({ ...value, season })}
          options={[
            { value: '', label: 'Whole series' },
            ...Array.from({ length: seasons }, (_, i) => ({
              value: String(i + 1),
              label: `Season ${i + 1}`,
            })),
          ]}
        />
      )}
    </div>
  );
}
