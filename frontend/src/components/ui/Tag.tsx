import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  new: 'bg-orange text-pixel-text',
  edit: 'bg-control text-white',
  note: 'bg-yellow border border-[#C8B85A] text-ink',
  plain: 'bg-panel border border-line text-ink',
} as const;

export function Tag({
  variant = 'plain',
  children,
  className,
}: {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block rounded-sm px-1 font-caps text-[11px] uppercase leading-[16px]',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
