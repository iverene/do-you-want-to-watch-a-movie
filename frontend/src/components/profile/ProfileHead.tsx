import { Link } from 'react-router-dom';
import { useGenres } from '@/queries/browse';
import { useSession } from '@/queries/auth';
import type { Profile } from '@/services';
import { PixelAvatar } from '../pixel/PixelAvatar';
import { ArrowLink } from '../ui/ArrowLink';
import { ChipLabel } from '../ui/Chip';

export function ProfileHead({ p }: { p: Profile }) {
  const { user, partner } = useSession();
  const genres = useGenres();
  const own = p.user.id === user.id;
  const other = own ? partner : user;
  const names = p.user.favoriteGenreIds
    .map((id) => genres.data?.items.find((g) => g.id === id)?.name)
    .filter(Boolean);
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex shrink-0 items-end justify-center border border-line bg-sky px-6 pb-2 pt-4">
        <PixelAvatar avatar={p.user.avatar} scale={8} label={`${p.user.displayName}'s avatar`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1 className="font-pixel text-[22px] leading-tight lg:text-[32px]">{p.user.displayName}</h1>
        <p className="text-[13px] text-muted">
          @{p.user.username} · {p.watchedCount.toLocaleString('en-US')} watched
          {p.tasteMatchPercent !== null && ` · taste match with ${other.displayName} ${p.tasteMatchPercent}%`}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-caps text-[11px] uppercase text-muted">FAVE GENRES</span>
          {names.length ? (
            names.map((n) => <ChipLabel key={n}>{n}</ChipLabel>)
          ) : (
            <span className="text-[12px] text-muted">none picked yet</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {own ? (
            <>
              <Link
                to="/settings"
                className="bevel inline-flex min-h-11 items-center rounded px-3 text-[13px] font-bold lg:min-h-9"
              >
                Customize avatar
              </Link>
              <ArrowLink to={`/profile/${partner.username}`}>
                View {partner.displayName}&apos;s profile
              </ArrowLink>
              <ArrowLink to="/settings" className="lg:hidden">
                Settings
              </ArrowLink>
            </>
          ) : (
            <ArrowLink to={`/profile/${user.username}`}>Back to my profile</ArrowLink>
          )}
        </div>
      </div>
    </div>
  );
}
