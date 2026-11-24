import type { Rating, User } from '@/services';
import { StarRating } from '../media/StarRating';
import { PixelAvatar } from '../pixel/PixelAvatar';

/** A comment bubble with the tail at the bottom right, and the author's avatar under it. */
export function SpeechBubble({ user, rating, hidden }: { user: User; rating?: Rating; hidden?: boolean }) {
  return (
    <figure className="flex flex-col items-end gap-1">
      <blockquote className="relative w-full rounded-[18px] border-2 border-ink bg-bubble px-[22px] py-4">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-pixel text-[16px] text-link">{user.displayName} :</span>
          {rating && <StarRating value={rating.stars} size={14} />}
        </p>
        {hidden ? (
          <div className="mt-2 border-2 border-dashed border-dot px-3 py-2">
            <p className="font-pixel text-[16px]" aria-hidden>
              {user.displayName[0]}: ?????
            </p>
            <p className="text-[12px] text-muted">
              {user.displayName}&apos;s stars stay hidden until you rate.
            </p>
          </div>
        ) : rating ? (
          <p className="mt-1 font-pixel text-[14px] leading-[1.6] lg:text-[16px]">
            {rating.comment || <span className="text-muted">[no comment, just stars]</span>}
          </p>
        ) : (
          <p className="mt-1 font-pixel text-[14px] text-muted lg:text-[16px]">[hasn&apos;t rated yet]</p>
        )}
        <span
          aria-hidden
          className="absolute -bottom-[10px] right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-ink bg-bubble"
        />
      </blockquote>
      <figcaption className="mr-4 mt-1">
        <PixelAvatar avatar={user.avatar} scale={2} label={`${user.displayName}'s avatar`} />
      </figcaption>
    </figure>
  );
}
