import { formatLong } from '@/lib/dates';
import { useSession } from '@/queries/auth';
import { useAnswerNight, useMovieNights } from '@/queries/movieNights';
import { useNames } from '@/queries/useNames';
import { BevelButton } from '../ui/BevelButton';
import { Tag } from '../ui/Tag';

/** Upcoming movie-night proposals; the other person accepts or declines (S8). */
export function MovieNights() {
  const nights = useMovieNights();
  const answer = useAnswerNight();
  const { user } = useSession();
  const nameOf = useNames();
  const items = (nights.data?.items ?? []).filter((n) => n.status !== 'declined');
  if (!items.length) return null;
  return (
    <section aria-labelledby="nights-title" className="flex flex-col gap-2 border border-line bg-panel p-3">
      <h2 id="nights-title" className="font-caps text-[11px] uppercase text-muted">
        MOVIE NIGHTS
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((n) => (
          <li key={n.id} className="flex flex-wrap items-center gap-2 text-[13px]">
            <Tag variant={n.status === 'accepted' ? 'new' : 'note'}>
              {n.status === 'accepted' ? 'ON' : 'ASKED'}
            </Tag>
            <span className="font-bold">{n.title.title}</span>
            <span className="text-muted">
              {formatLong(n.date)} · asked by {nameOf(n.proposedBy)}
            </span>
            {n.status === 'proposed' && n.proposedBy !== user.id && (
              <span className="ml-auto flex gap-2">
                <BevelButton
                  dense
                  disabled={answer.isPending}
                  onClick={() => answer.mutate({ id: n.id, status: 'accepted' })}
                >
                  Accept
                </BevelButton>
                <BevelButton
                  dense
                  disabled={answer.isPending}
                  onClick={() => answer.mutate({ id: n.id, status: 'declined' })}
                >
                  Decline
                </BevelButton>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
