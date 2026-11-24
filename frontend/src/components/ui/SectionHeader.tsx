import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  title: ReactNode;
  sub?: string;
  right?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function SectionHeader({ title, sub, right, as: H = 'h2', className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-2 border-b border-line pb-[5px]',
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <H className="text-[14px] font-extrabold text-link lg:text-[16px]">{title}</H>
        {sub && <span className="font-caps text-[11px] uppercase text-muted">{sub}</span>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}
