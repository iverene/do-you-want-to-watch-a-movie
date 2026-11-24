const MAX_BLOCKS = 18;

/** Genre bars: a row of 12px square blocks per genre, scaled to the largest count (max 18). */
export function PixelBarChart({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const scale = max > MAX_BLOCKS ? MAX_BLOCKS / max : 1;
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((r) => {
        const filled = Math.max(r.count ? 1 : 0, Math.round(r.count * scale));
        return (
          <li key={r.label} className="flex items-center gap-2" aria-label={`${r.label}: ${r.count}`}>
            <span className="w-[90px] shrink-0 truncate text-[13px]">{r.label}</span>
            <span aria-hidden className="flex flex-1 flex-wrap gap-[2px]">
              {Array.from({ length: Math.min(MAX_BLOCKS, Math.ceil(max * scale)) }, (_, i) => (
                <span key={i} className={i < filled ? 'h-3 w-3 bg-tab' : 'h-3 w-3 bg-inner'} />
              ))}
            </span>
            <span aria-hidden className="w-6 text-right text-[12px] font-bold">
              {r.count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
