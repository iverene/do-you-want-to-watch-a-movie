import type { ReactNode } from 'react';

export function BigNumber({
  label,
  value,
  caption,
}: {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border border-line p-3">
      <span className="font-caps text-[11px] uppercase text-muted">{label}</span>
      <span className="truncate font-pixel text-[26px] leading-tight lg:text-[34px]">{value}</span>
      {caption && <span className="text-[12px] text-muted">{caption}</span>}
    </div>
  );
}
