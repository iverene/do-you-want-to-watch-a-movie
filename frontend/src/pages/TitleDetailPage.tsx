import { useParams } from 'react-router-dom';
import { SpeechBubble } from '@/components/comments/SpeechBubble';
import { DetailActions } from '@/components/detail/DetailActions';
import { DetailTopRow } from '@/components/detail/DetailTopRow';
import { ErrorState } from '@/components/feedback/ErrorState';
import { FramedPoster } from '@/components/media/FramedPoster';
import { StarRating } from '@/components/media/StarRating';
import { ArrowButton, ArrowLink } from '@/components/ui/ArrowLink';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LineSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Tag } from '@/components/ui/Tag';
import { useLogWatch } from '@/app/LogWatchContext';
import { formatLong } from '@/lib/dates';
import { runtime, typeLabel } from '@/lib/format';
import { useSession } from '@/queries/auth';
import { useProviders } from '@/queries/movies';
import { useScreening } from '@/queries/screenings';
import { isApiError } from '@/services';

export default function TitleDetailPage() {
  const { screeningId } = useParams();
  const q = useScreening(screeningId);
  const providers = useProviders(q.data?.screening.title.id);
  const { users, user, partner } = useSession();
  const { open } = useLogWatch();

  if (q.isPending)
    return (
      <div className="flex gap-5">
        <Skeleton className="h-[290px] w-[200px]" />
        <div className="flex-1">
          <LineSkeleton lines={6} />
        </div>
      </div>
    );
  if (q.isError)
    return isApiError(q.error, 'NOT_FOUND') ? (
      <div className="flex flex-col gap-3">
        <p className="font-hand text-[19px] text-muted">this one isn&apos;t in your diary.</p>
        <ArrowLink to="/watched">Back to Watched</ArrowLink>
      </div>
    ) : (
      <ErrorState error={q.error} onRetry={() => void q.refetch()} />
    );

  const { screening: s, history } = q.data;
  const t = s.title;
  const together = s.viewerIds.length > 1;
  const others = history.filter((h) => h.id !== s.id);
  const when = (h: { watchedOn: string | null; watchedYear: number }) =>
    h.watchedOn ? formatLong(h.watchedOn) : `sometime in ${h.watchedYear}`;
  const provider = providers.data?.items.map((p) => p.name).join(', ');
  const viewers = users.filter((u) => s.viewerIds.includes(u.id));
  const visibleCount = s.ratings.length;
  const newest = s.ratings.some((r) => Date.now() - Date.parse(r.updatedAt) < 3 * 86400_000);

  return (
    <article className="flex flex-col gap-5">
      <DetailTopRow s={s} />
      <div className="flex flex-col gap-5 md:flex-row">
        <FramedPoster
          title={t.title}
          posterUrl={t.posterUrl}
          tintKey={t.id}
          className="w-[160px] self-center md:w-[200px] md:self-start"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-caps text-[11px] uppercase text-muted">
            {typeLabel(t.mediaType)} ·{' '}
            {together ? 'WATCHED TOGETHER' : `SOLO · ${viewers[0]?.displayName ?? ''}`}
            {s.season && ` · SEASON ${s.season}`}
          </p>
          <h1 className="font-pixel text-[22px] leading-tight lg:text-[32px]">{t.title}</h1>
          <p className="text-[12px] text-muted lg:text-[13px]">
            {[t.year, t.genres.map((g) => g.name).join(', '), runtime(t.runtimeMinutes)]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[28px] lg:text-[38px]">{s.averageStars ?? '—'}</span>
            <span className="flex flex-col">
              <StarRating value={s.averageStars} size={18} />
              <span className="text-[12px] text-muted">
                {s.averageStars === null
                  ? 'not rated yet'
                  : visibleCount > 1
                    ? 'average of you two'
                    : s.hiddenPartnerRating
                      ? `rate to see ${partner.displayName}'s`
                      : 'one rating so far'}
              </span>
            </span>
          </div>
          {t.overview && <p className="text-[14px] leading-relaxed">{t.overview}</p>}
          {t.cast.length > 0 && (
            <p className="text-[13px]">
              <span className="font-extrabold">Cast </span>
              {t.cast.map((c) => c.name).join(', ')}
            </p>
          )}
          <p className="text-[13px]">
            <span className="font-extrabold">Stream in PH: </span>
            {providers.isPending ? '…' : provider || 'not streaming right now'}
          </p>
          <p className="text-[13px]">
            <span className="font-extrabold">Watched </span>
            {when(s)}
            {others.length > 0 &&
              ` · also ${others.map((h) => `${when(h)} (${h.id === history[history.length - 1].id ? 'first watch' : 'rewatch'})`).join(', ')}`}
          </p>
          <DetailActions s={s} />
        </div>
      </div>
      <section aria-labelledby="comments-title" className="flex flex-col gap-4">
        <SectionHeader
          title={
            <span id="comments-title" className="flex items-center gap-2">
              Ratings &amp; comments ({visibleCount}) {newest && <Tag variant="new">NEW!</Tag>}
            </span>
          }
          right={
            s.viewerIds.includes(user.id) ? (
              <ArrowButton onClick={() => open({ mode: 'rate', screening: s })}>Write a comment</ArrowButton>
            ) : undefined
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {viewers.map((u) => (
            <SpeechBubble
              key={u.id}
              user={u}
              rating={s.ratings.find((r) => r.userId === u.id)}
              hidden={u.id === partner.id && s.hiddenPartnerRating}
            />
          ))}
        </div>
      </section>
    </article>
  );
}
