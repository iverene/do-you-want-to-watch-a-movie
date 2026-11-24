import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Poster } from './Poster';

interface Props {
  title: string;
  posterUrl: string | null;
  tintKey?: string;
  meta?: ReactNode;
  extra?: ReactNode;
  to?: string;
  onClick?: () => void;
  posterClass?: string;
  className?: string;
}

/** Poster with a title (bold, ellipsis), a meta line and an optional extra line. */
export function PosterCard({
  title,
  posterUrl,
  tintKey,
  meta,
  extra,
  to,
  onClick,
  posterClass = 'w-[92px]',
  className,
}: Props) {
  const body = (
    <>
      <Poster title={title} posterUrl={posterUrl} tintKey={tintKey} className={posterClass} decorative />
      <span className="mt-1.5 block truncate text-[13px] font-bold lg:text-[14px]">{title}</span>
      {meta && <span className="block truncate text-[12px] text-muted">{meta}</span>}
    </>
  );
  const cls = cn('flex min-w-0 flex-col text-left', className);
  return (
    <div className={cn('flex shrink-0 flex-col', posterClass.match(/w-\[\d+px\]/)?.[0])}>
      {to ? (
        <Link to={to} className={cn(cls, 'hover:underline')}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={cn(cls, 'hover:underline')}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
      {extra && <div className="mt-0.5 text-[12px]">{extra}</div>}
    </div>
  );
}
