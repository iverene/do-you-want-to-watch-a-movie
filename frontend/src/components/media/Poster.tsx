import { useState } from 'react';
import { cn } from '@/lib/cn';

const TINTS = ['#D9E6FA', '#FBE1D3', '#E2F1D8', '#EFE3FA', '#FFF0B8', '#DDEFF3'];

export function tintFor(key: string): string {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

interface Props {
  title: string;
  posterUrl: string | null;
  tintKey?: string;
  className?: string;
  decorative?: boolean;
}

/** 2:3 poster with square corners. Tinted "POSTER" placeholder when there is no image, while loading and on error. */
export function Poster({ title, posterUrl, tintKey, className, decorative }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = posterUrl && !failed;
  return (
    <div
      className={cn('relative aspect-[2/3] shrink-0 overflow-hidden border border-line', className)}
      style={{ backgroundColor: tintFor(tintKey ?? title) }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Poster for ${title}`}
      aria-hidden={decorative || undefined}
    >
      {(!showImage || !loaded) && (
        <span className="absolute inset-0 flex items-center justify-center font-caps text-[11px] text-[#6B6E75]">
          POSTER
        </span>
      )}
      {showImage && (
        <img
          src={posterUrl}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('absolute inset-0 h-full w-full object-cover', loaded ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  );
}
