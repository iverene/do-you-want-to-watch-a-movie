import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { Title } from '@/services';
import { TitlePreview } from '../dialogs/TitlePreview';
import { PosterTile } from '../media/PosterTile';

export interface RowItem {
  title: Title;
  /** Shown in the preview, e.g. "92% match · because you both liked …". */
  note?: string;
}

const IDLE_MS = 1200;

/**
 * A row of poster-only tiles that scrolls sideways with no visible scrollbar. ◀ ▶ buttons appear
 * while you scroll or hover the row, and only on a side that has more to see.
 */
export function PosterRow({ items, label }: { items: RowItem[]; label: string }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>();
  const [preview, setPreview] = useState<RowItem | null>(null);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, items.length]);

  useEffect(() => () => clearTimeout(idle.current), []);

  const onScroll = () => {
    measure();
    setActive(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setActive(false), IDLE_MS);
  };
  const page = (dir: -1 | 1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  const visible = active || hover;
  const arrow =
    'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pixel-border bg-yellow text-[13px] text-pixel-text shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition-opacity focus-visible:opacity-100';

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <ul
        ref={scroller}
        aria-label={label}
        onScroll={onScroll}
        className="no-scrollbar flex gap-3 overflow-x-auto py-1"
      >
        {items.map((it) => (
          <li key={it.title.id}>
            <PosterTile title={it.title} onOpen={() => setPreview(it)} />
          </li>
        ))}
      </ul>
      {edges.left && (
        <button
          type="button"
          aria-label={`Scroll ${label} left`}
          onClick={() => page(-1)}
          className={cn(arrow, '-left-2', visible ? 'opacity-100' : 'pointer-events-none opacity-0')}
        >
          ◀
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          aria-label={`Scroll ${label} right`}
          onClick={() => page(1)}
          className={cn(arrow, '-right-2', visible ? 'opacity-100' : 'pointer-events-none opacity-0')}
        >
          ▶
        </button>
      )}
      {preview && <TitlePreview title={preview.title} note={preview.note} onClose={() => setPreview(null)} />}
    </div>
  );
}
