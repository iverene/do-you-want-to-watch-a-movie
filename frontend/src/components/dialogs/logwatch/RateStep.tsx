import { useState } from 'react';
import { formatLong } from '@/lib/dates';
import { titleMeta } from '@/lib/format';
import { useSession } from '@/queries/auth';
import { useRate } from '@/queries/screenings';
import { errorMessage, type Screening, type Stars } from '@/services';
import { FramedPoster } from '../../media/FramedPoster';
import { StarInput } from '../../media/StarInput';
import { ArrowButton } from '../../ui/ArrowLink';
import { TextArea } from '../../ui/Field';
import { LogWatchButton } from '../../ui/LogWatchButton';
import { useToast } from '../../ui/Toast';

export function RateStep({
  screening,
  justSaved,
  onDone,
  onDirty,
}: {
  screening: Screening;
  justSaved?: boolean;
  onDone: () => void;
  onDirty: (d: boolean) => void;
}) {
  const { user, partner } = useSession();
  const mine = screening.ratings.find((r) => r.userId === user.id);
  const [stars, setStars] = useState<Stars | null>(mine?.stars ?? null);
  const [comment, setComment] = useState(mine?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const rate = useRate();
  const toast = useToast();
  const t = screening.title;
  const partnerRated =
    screening.hiddenPartnerRating || screening.ratings.some((r) => r.userId === partner.id);
  const together = screening.viewerIds.includes(partner.id);

  const submit = () => {
    if (!stars) return setError('Pick 1 to 5 stars, or skip for now.');
    rate.mutate(
      { id: screening.id, body: { stars, comment: comment.trim() || undefined } },
      {
        onSuccess: () => {
          toast.show(`Rated ${t.title}`);
          onDone();
        },
        onError: (e) => setError(errorMessage(e)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {justSaved && (
        <p
          role="status"
          className="border border-success-border bg-success-bg px-3 py-2 text-[13px] font-bold text-success-text"
        >
          ✓ SAVED {t.title} is in Watched ·{' '}
          {screening.watchedOn ? formatLong(screening.watchedOn) : screening.watchedYear}
        </p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row">
        <FramedPoster
          title={t.title}
          posterUrl={t.posterUrl}
          tintKey={t.id}
          className="w-[110px] self-center sm:self-start"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <p className="font-pixel text-[22px] leading-tight">{t.title}</p>
            <p className="text-[12px] text-muted">{titleMeta(t)}</p>
          </div>
          <StarInput
            label={`Your rating, ${user.displayName}`}
            value={stars}
            onChange={(s) => {
              setStars(s);
              setError(null);
              onDirty(true);
            }}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="rate-comment" className="text-[13px] font-extrabold">
              Comment <span className="font-normal text-muted">optional</span>
            </label>
            <TextArea
              id="rate-comment"
              value={comment}
              maxLength={500}
              onChange={(e) => {
                setComment(e.target.value);
                onDirty(true);
              }}
              placeholder="what did you think?"
            />
          </div>
          {together && (
            <p className="text-[12px] text-muted">
              {partnerRated && !mine
                ? `${partner.displayName}'s stars stay hidden until you rate.`
                : `Your stars stay hidden from ${partner.displayName} until they rate too.`}
            </p>
          )}
          {error && (
            <p role="alert" className="text-[13px] text-red">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <LogWatchButton icon="★" onClick={submit} disabled={rate.isPending}>
              Save rating
            </LogWatchButton>
            <ArrowButton onClick={onDone}>Skip for now</ArrowButton>
          </div>
        </div>
      </div>
    </div>
  );
}
