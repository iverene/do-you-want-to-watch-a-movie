import type { WatchlistItem } from '@/services';
import { titleMeta } from '@/lib/format';
import { FramedPoster } from '../media/FramedPoster';
import { Tag } from '../ui/Tag';

export function SpinResult({ item, onClose }: { item: WatchlistItem; onClose: () => void }) {
  return (
    <div
      role="status"
      className="pop-in flex items-center gap-3 border-2 border-pixel-border bg-yellow p-3 text-ink"
    >
      <FramedPoster
        title={item.title.title}
        posterUrl={item.title.posterUrl}
        tintKey={item.title.id}
        className="w-16"
        mat="p-1"
      />
      <div className="min-w-0 flex-1">
        <Tag variant="note">THE SPINNER SAYS</Tag>
        <p className="mt-1 font-pixel text-[20px] leading-tight">{item.title.title}</p>
        <p className="text-[12px] text-muted">{titleMeta(item.title)}</p>
      </div>
      <button type="button" onClick={onClose} className="min-h-11 text-[12px] text-link underline">
        close
      </button>
    </div>
  );
}
